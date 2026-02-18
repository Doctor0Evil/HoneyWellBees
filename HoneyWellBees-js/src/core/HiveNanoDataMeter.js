/**
 * Estimate NanoData volume and uncertainty for a hive run, using
 * virtual-object counts, telemetry density, and actuation decisions.
 */
export function estimateNanoDataVolumeForHiveRun(runStats) {
  if (!runStats || typeof runStats !== "object") {
    throw new Error("estimateNanoDataVolumeForHiveRun: runStats is required.");
  }

  const virtualObjects = toNumber(runStats.virtualObjects, 0);
  const decisions = toNumber(runStats.decisions, 0);
  const telemetrySamples = toNumber(runStats.telemetrySamples, 0);

  const sizeBytes =
    virtualObjects * 256 + // approx bytes per virtual-object descriptor
    decisions * 192 + // bytes per decision log entry
    telemetrySamples * 128; // bytes per normalized telemetry snapshot

  const kiloBytes = sizeBytes / 1024;
  const megaBytes = kiloBytes / 1024;

  return {
    virtualObjects,
    decisions,
    telemetrySamples,
    approxBytes: sizeBytes,
    approxKB: kiloBytes,
    approxMB: megaBytes
  };
}

/**
 * Score uncertainty (0..1) from stability and drift metrics across sessions.
 * Higher drift and lower stability -> higher uncertainty.
 */
export function scoreUncertaintyFromStabilityDrift(stability, drift) {
  const s = clamp01(typeof stability === "number" ? stability : 0.5);
  const d = clamp01(typeof drift === "number" ? drift : 0.0);

  const uncertainty = clamp01(0.6 * (1 - s) + 0.4 * d);
  return {
    stability,
    drift,
    uncertainty
  };
}

function toNumber(value, fallback) {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim().length > 0 && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return fallback;
}

function clamp01(x) {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export default {
  estimateNanoDataVolumeForHiveRun,
  scoreUncertaintyFromStabilityDrift
};
