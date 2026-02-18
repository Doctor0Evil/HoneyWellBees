import crypto from "node:crypto";

/**
 * In-memory archivist for pattern snapshots.
 * For production, you can back this with SQLite or a ledger client.
 */
export class HivePatternArchivist {
  constructor(options = {}) {
    this.maxPerHive = typeof options.maxPerHive === "number" ? options.maxPerHive : 256;
    this.store = new Map(); // hiveId -> { snapshots: [], motifs: Map }
  }

  /**
   * Record a new pattern snapshot for a hive.
   * @param {string} hiveId
   * @param {object} snapshot - arbitrary object with band, bioload, metrics, decisions, etc.
   */
  recordHivePatternSnapshot(hiveId, snapshot) {
    if (!hiveId || typeof hiveId !== "string") {
      throw new Error("recordHivePatternSnapshot: hiveId must be a string.");
    }
    if (!snapshot || typeof snapshot !== "object") {
      throw new Error("recordHivePatternSnapshot: snapshot must be an object.");
    }

    const entry = this.ensureHiveEntry(hiveId);
    const id = this.makeSnapshotId(hiveId, snapshot);
    const record = {
      id,
      hiveId,
      capturedAt: new Date().toISOString(),
      snapshot
    };

    entry.snapshots.push(record);
    if (entry.snapshots.length > this.maxPerHive) {
      entry.snapshots.shift();
    }

    this.updateMotifs(entry, record);
    return record;
  }

  /**
   * Find snapshots whose simple descriptor matches a query pattern.
   * @param {object} query - e.g. { band: "yellow", bioload: "elevated" }
   */
  findSimilarHivePatterns(query) {
    if (!query || typeof query !== "object") {
      throw new Error("findSimilarHivePatterns: query must be an object.");
    }

    const results = [];
    for (const entry of this.store.values()) {
      for (const record of entry.snapshots) {
        const desc = this.describeSnapshot(record.snapshot);
        if (matchesQuery(desc, query)) {
          results.push({
            id: record.id,
            hiveId: record.hiveId,
            capturedAt: record.capturedAt,
            descriptor: desc
          });
        }
      }
    }
    return results;
  }

  ensureHiveEntry(hiveId) {
    if (!this.store.has(hiveId)) {
      this.store.set(hiveId, { snapshots: [], motifs: new Map() });
    }
    return this.store.get(hiveId);
  }

  makeSnapshotId(hiveId, snapshot) {
    const base = hiveId + JSON.stringify(this.describeSnapshot(snapshot)) + Date.now();
    return crypto.createHash("sha256").update(base).digest("hex").slice(0, 16);
  }

  updateMotifs(entry, record) {
    const descriptor = this.describeSnapshot(record.snapshot);
    const key = JSON.stringify(descriptor);
    const motifs = entry.motifs;
    if (!motifs.has(key)) {
      motifs.set(key, { count: 0, lastSeen: null });
    }
    const motif = motifs.get(key);
    motif.count += 1;
    motif.lastSeen = record.capturedAt;
  }

  describeSnapshot(snapshot) {
    const band = (snapshot.band || snapshot.band_state || "").toLowerCase();
    const bioload = (snapshot.bioload || "").toLowerCase();
    const temp = snapshot.brood_temp_c ?? snapshot.metrics?.brood_temp_c ?? null;
    const humidity =
      snapshot.brood_humidity_pct ?? snapshot.metrics?.brood_humidity_pct ?? null;

    return {
      band,
      bioload,
      tempBand: numericBand(temp, 30, 32, 36, 38),
      humidityBand: numericBand(humidity, 40, 50, 70, 80)
    };
  }
}

function numericBand(value, lowRed, lowYellow, highYellow, highRed) {
  if (value === null || typeof value !== "number" || Number.isNaN(value)) {
    return "unknown";
  }
  if (value < lowRed || value > highRed) return "red";
  if (value < lowYellow || value > highYellow) return "yellow";
  return "green";
}

function matchesQuery(desc, query) {
  for (const [k, v] of Object.entries(query)) {
    if (v == null) continue;
    if (String(desc[k]).toLowerCase() !== String(v).toLowerCase()) {
      return false;
    }
  }
  return true;
}

export default HivePatternArchivist;
