/**
 * Normalize an arbitrary raw telemetry object into a strict, numeric metric set.
 * Missing values are filled with null-safe defaults but flagged in the metadata.
 */
export function normalizeHiveTelemetry(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("normalizeHiveTelemetry: raw telemetry must be an object.");
  }

  const normalized = {
    brood_temp_c: numberOrNull(raw.brood_temp_c),
    brood_humidity_pct: numberOrNull(raw.brood_humidity_pct),
    acoustic_surplus_db: numberOrNull(raw.acoustic_surplus_db),
    daily_mortality_pct: numberOrNull(raw.daily_mortality_pct),
    hive_weight_kg_x10: numberOrNull(raw.hive_weight_kg_x10),
    forager_return_delta_pct: numberOrNull(raw.forager_return_delta_pct),
    varroa_mites_per_100_bees: numberOrNull(raw.varroa_mites_per_100_bees)
  };

  const missing = [];
  for (const [k, v] of Object.entries(normalized)) {
    if (v === null) missing.push(k);
  }

  return {
    metrics: normalized,
    missingFields: missing,
    source: raw,
    normalizedAt: new Date().toISOString()
  };
}

/**
 * Convert normalized metrics into an EFSA-style metric view object,
 * ready to compare against SPG thresholds.
 */
export function toEfsaMetricView(normalized) {
  if (!normalized || typeof normalized !== "object" || !normalized.metrics) {
    throw new Error("toEfsaMetricView: normalized telemetry object is required.");
  }
  const m = normalized.metrics;

  return {
    colonyStrengthProxy: {
      dailyMortalityPct: m.daily_mortality_pct,
      foragerReturnDeltaPct: m.forager_return_delta_pct
    },
    stressProxies: {
      broodTempC: m.brood_temp_c,
      broodHumidityPct: m.brood_humidity_pct,
      acousticSurplusDb: m.acoustic_surplus_db
    },
    parasiteLoad: {
      varroaMitesPer100Bees: m.varroa_mites_per_100_bees
    },
    resourceProxy: {
      hiveWeightKg: m.hive_weight_kg_x10 !== null ? m.hive_weight_kg_x10 / 10 : null
    },
    metadata: {
      missingFields: normalized.missingFields,
      normalizedAt: normalized.normalizedAt
    }
  };
}

function numberOrNull(value) {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

export default {
  normalizeHiveTelemetry,
  toEfsaMetricView
};
