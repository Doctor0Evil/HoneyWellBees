/**
 * Detect anomalies in a hive time series using simple deviation heuristics.
 * @param {Array<object>} series - ordered by time, each with metrics fields.
 */
export function detectAnomaliesInHiveSeries(series) {
  if (!Array.isArray(series) || series.length < 3) {
    throw new Error("detectAnomaliesInHiveSeries: series must have at least 3 points.");
  }

  const fields = [
    "brood_temp_c",
    "brood_humidity_pct",
    "acoustic_surplus_db",
    "daily_mortality_pct",
    "varroa_mites_per_100_bees"
  ];

  const stats = {};
  for (const f of fields) {
    const values = series
      .map((s) => valueFromSeriesEntry(s, f))
      .filter((v) => typeof v === "number" && !Number.isNaN(v));
    stats[f] = computeMeanStd(values);
  }

  const anomalies = [];
  series.forEach((entry, idx) => {
    const entryAnoms = [];
    for (const f of fields) {
      const v = valueFromSeriesEntry(entry, f);
      const { mean, std } = stats[f];
      if (std <= 0 || v == null || Number.isNaN(v)) continue;
      const z = Math.abs((v - mean) / std);
      if (z >= 3) {
        entryAnoms.push({ field: f, value: v, zScore: z });
      }
    }
    if (entryAnoms.length > 0) {
      anomalies.push({
        index: idx,
        timestamp: entry.timestamp || null,
        anomalies: entryAnoms
      });
    }
  });

  return anomalies;
}

/**
 * Rank anomalies by a simple risk score combining field importance and z-score.
 */
export function rankAnomaliesByRisk(anomalies) {
  const weights = {
    brood_temp_c: 1.0,
    brood_humidity_pct: 0.8,
    acoustic_surplus_db: 0.6,
    daily_mortality_pct: 1.2,
    varroa_mites_per_100_bees: 1.4
  };

  const ranked = anomalies.map((a) => {
    let score = 0;
    for (const an of a.anomalies) {
      const w = weights[an.field] ?? 0.5;
      score += w * an.zScore;
    }
    return { ...a, riskScore: score };
  });

  ranked.sort((a, b) => b.riskScore - a.riskScore);
  return ranked;
}

function valueFromSeriesEntry(entry, field) {
  if (typeof entry[field] === "number") return entry[field];
  if (entry.metrics && typeof entry.metrics[field] === "number") {
    return entry.metrics[field];
  }
  return null;
}

function computeMeanStd(values) {
  if (!values.length) return { mean: 0, std: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / values.length;
  return { mean, std: Math.sqrt(variance) };
}

export default {
  detectAnomaliesInHiveSeries,
  rankAnomaliesByRisk
};
