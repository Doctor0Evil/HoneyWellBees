/**
 * Estimate band state using simple threshold bands.
 * Thresholds should be derived from EFSA/IUCN and local policy engine.
 */
export function estimateBandStateFromTelemetry(telemetry, bandThresholds) {
  if (!telemetry || typeof telemetry !== "object") {
    throw new Error("estimateBandStateFromTelemetry: telemetry is required.");
  }
  if (!bandThresholds || typeof bandThresholds !== "object") {
    throw new Error("estimateBandStateFromTelemetry: bandThresholds are required.");
  }

  const t = telemetry.metrics || telemetry;
  const bt = bandThresholds;

  const red =
    outOfRange(t.brood_temp_c, bt.red_min_temp_c, bt.red_max_temp_c) ||
    outOfRange(t.brood_humidity_pct, bt.red_min_humidity_pct, bt.red_max_humidity_pct) ||
    greaterThan(t.acoustic_surplus_db, bt.red_max_acoustic_surplus_db) ||
    greaterThan(t.daily_mortality_pct, bt.red_max_daily_mortality_pct);

  if (red) return "red";

  const yellow =
    outOfRange(t.brood_temp_c, bt.yellow_min_temp_c, bt.yellow_max_temp_c) ||
    outOfRange(t.brood_humidity_pct, bt.yellow_min_humidity_pct, bt.yellow_max_humidity_pct) ||
    greaterThan(t.acoustic_surplus_db, bt.yellow_max_acoustic_surplus_db) ||
    greaterThan(t.daily_mortality_pct, bt.yellow_max_daily_mortality_pct);

  if (yellow) return "yellow";

  return "green";
}

/**
 * Compute bioload (parasite load) state.
 */
export function computeBioloadState(telemetry, bioloadThresholds) {
  if (!telemetry || typeof telemetry !== "object") {
    throw new Error("computeBioloadState: telemetry is required.");
  }
  if (!bioloadThresholds || typeof bioloadThresholds !== "object") {
    throw new Error("computeBioloadState: bioloadThresholds are required.");
  }

  const t = telemetry.metrics || telemetry;
  const mites = t.varroa_mites_per_100_bees;

  if (mites === null || typeof mites !== "number" || Number.isNaN(mites)) {
    return "unknown";
  }

  if (mites >= bioloadThresholds.critical_mites_per_100_bees) {
    return "critical";
  }
  if (mites >= bioloadThresholds.elevated_mites_per_100_bees) {
    return "elevated";
  }
  return "nominal";
}

function outOfRange(value, min, max) {
  if (value === null || typeof value !== "number" || Number.isNaN(value)) return false;
  if (typeof min === "number" && value < min) return true;
  if (typeof max === "number" && value > max) return true;
  return false;
}

function greaterThan(value, limit) {
  if (value === null || typeof value !== "number" || Number.isNaN(value)) return false;
  if (typeof limit !== "number") return false;
  return value > limit;
}

export default {
  estimateBandStateFromTelemetry,
  computeBioloadState
};
