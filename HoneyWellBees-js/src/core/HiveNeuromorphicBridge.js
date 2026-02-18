import crypto from "node:crypto";

/**
 * @typedef {Object} ShardActuatorFrame
 * @property {number} heater_celsius
 * @property {number} fan_duty_pct
 * @property {number} led_lux
 */

/**
 * @typedef {Object} ShardSensorSnapshot
 * @property {number} brood_temp_c
 * @property {number} brood_humidity_pct
 * @property {number} acoustic_surplus_db
 * @property {number} daily_mortality_pct
 * @property {number} hive_weight_kg_x10
 * @property {number} forager_return_delta_pct
 * @property {number} varroa_mites_per_100_bees
 */

/**
 * Map a shard actuator frame and sensor snapshot into virtual-objects
 * suitable for Javaspectre-style introspection and NanoData metering.
 */
export function mapShardFrameToVirtualObjects(frame, sensors, meta = {}) {
  validateFrame(frame);
  validateSensors(sensors);

  const baseId = genBaseId(meta.hiveId || "hive");
  const virtualObjects = [];
  const relationships = [];

  const sensorVoId = baseId + "-sensors";
  const actuatorVoId = baseId + "-actuators";

  virtualObjects.push({
    id: sensorVoId,
    category: "hive-telemetry",
    hiveId: meta.hiveId || "unknown-hive",
    tick: meta.tick ?? null,
    fields: {
      brood_temp_c: sensors.brood_temp_c,
      brood_humidity_pct: sensors.brood_humidity_pct,
      acoustic_surplus_db: sensors.acoustic_surplus_db,
      daily_mortality_pct: sensors.daily_mortality_pct,
      hive_weight_kg_x10: sensors.hive_weight_kg_x10,
      forager_return_delta_pct: sensors.forager_return_delta_pct,
      varroa_mites_per_100_bees: sensors.varroa_mites_per_100_bees
    },
    signature: "hive-telemetry-v1"
  });

  virtualObjects.push({
    id: actuatorVoId,
    category: "hive-actuation",
    hiveId: meta.hiveId || "unknown-hive",
    tick: meta.tick ?? null,
    fields: {
      heater_celsius: frame.heater_celsius,
      fan_duty_pct: frame.fan_duty_pct,
      led_lux: frame.led_lux
    },
    signature: "hive-actuation-v1"
  });

  relationships.push({
    from: sensorVoId,
    to: actuatorVoId,
    relation: "drives-actuation",
    tick: meta.tick ?? null
  });

  return { virtualObjects, relationships };
}

/**
 * Compute a simple neuromorphic quota usage estimate per step for NanoData metering.
 * This is a JS-side approximation, aligned with Rust ShardLimits semantics.
 */
export function computeNeuromorphicQuotaUsage(frame, sensors, limits, meta = {}) {
  validateFrame(frame);
  validateSensors(sensors);
  if (!limits || typeof limits !== "object") {
    throw new Error("computeNeuromorphicQuotaUsage: limits must be a non-null object.");
  }

  const heaterIntensity = Math.max(0, frame.heater_celsius);
  const fanIntensity = Math.max(0, frame.fan_duty_pct);
  const ledIntensity = Math.max(0, frame.led_lux);

  const actuationScore =
    heaterIntensity / Math.max(1, limits.heater_ref_celsius || 10) +
    fanIntensity / Math.max(1, limits.fan_ref_duty_pct || 50) +
    ledIntensity / Math.max(1, limits.led_ref_lux || 500);

  const opsEstimate = Math.max(1, Math.round(actuationScore * 100));
  const joulesPerOp = limits.joules_per_op || 0.0001;
  const estimatedJoules = opsEstimate * joulesPerOp;

  const spikeQuotaPct = Math.min(
    1,
    opsEstimate / Math.max(1, limits.max_spikes_per_period || 10000)
  );
  const energyQuotaPct = Math.min(
    1,
    estimatedJoules / Math.max(1e-6, limits.max_joules_per_period || 1.0)
  );

  return {
    hiveId: meta.hiveId || "unknown-hive",
    tick: meta.tick ?? null,
    opsEstimate,
    estimatedJoules,
    spikeQuotaPct,
    energyQuotaPct,
    safe: spikeQuotaPct <= 1 && energyQuotaPct <= 1
  };
}

function genBaseId(seed) {
  const ts = Date.now().toString(36);
  const hash = crypto.createHash("sha256").update(seed + ts).digest("hex").slice(0, 6);
  return `hwb-${hash}`;
}

function validateFrame(frame) {
  if (!frame || typeof frame !== "object") {
    throw new Error("HiveNeuromorphicBridge: frame must be an object.");
  }
  const keys = ["heater_celsius", "fan_duty_pct", "led_lux"];
  for (const k of keys) {
    if (typeof frame[k] !== "number" || Number.isNaN(frame[k])) {
      throw new Error(`HiveNeuromorphicBridge: frame.${k} must be a number.`);
    }
  }
}

function validateSensors(sensors) {
  if (!sensors || typeof sensors !== "object") {
    throw new Error("HiveNeuromorphicBridge: sensors must be an object.");
  }
  const keys = [
    "brood_temp_c",
    "brood_humidity_pct",
    "acoustic_surplus_db",
    "daily_mortality_pct",
    "hive_weight_kg_x10",
    "forager_return_delta_pct",
    "varroa_mites_per_100_bees"
  ];
  for (const k of keys) {
    if (typeof sensors[k] !== "number" || Number.isNaN(sensors[k])) {
      throw new Error(`HiveNeuromorphicBridge: sensors.${k} must be a number.`);
    }
  }
}

export default {
  mapShardFrameToVirtualObjects,
  computeNeuromorphicQuotaUsage
};
