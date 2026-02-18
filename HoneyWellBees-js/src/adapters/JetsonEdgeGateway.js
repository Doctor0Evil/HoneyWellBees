import EventEmitter from "node:events";
import { mapShardFrameToVirtualObjects, computeNeuromorphicQuotaUsage } from "../core/HiveNeuromorphicBridge.js";
import { normalizeHiveTelemetry } from "../core/HiveTelemetryNormalizer.js";

/**
 * JetsonEdgeGateway
 * - Consumes shard runtime frames from an input stream (e.g., MQTT, file, stdin).
 * - Publishes normalized metrics and virtual-objects to listeners.
 */
export class JetsonEdgeGateway extends EventEmitter {
  constructor(options = {}) {
    super();
    this.hiveId = options.hiveId || "unknown-hive";
    this.limits = {
      heater_ref_celsius: 5,
      fan_ref_duty_pct: 50,
      led_ref_lux: 400,
      joules_per_op: 0.00005,
      max_spikes_per_period: 10000,
      max_joules_per_period: 1.0,
      ...options.limits
    };
  }

  /**
   * Ingest a single shard tick from Rust (actuator frame + sensors).
   * @param {object} payload - { frame: ShardActuatorFrame, sensors: ShardSensorSnapshot, tick: number }
   */
  ingestShardTick(payload) {
    if (!payload || typeof payload !== "object") {
      throw new Error("JetsonEdgeGateway.ingestShardTick: payload must be an object.");
    }
    const { frame, sensors, tick } = payload;
    const meta = { hiveId: this.hiveId, tick };

    const normalized = normalizeHiveTelemetry(sensors);
    const vo = mapShardFrameToVirtualObjects(frame, normalized.metrics, meta);
    const quota = computeNeuromorphicQuotaUsage(frame, normalized.metrics, this.limits, meta);

    this.emit("telemetry", {
      hiveId: this.hiveId,
      tick,
      normalizedTelemetry: normalized,
      virtualObjects: vo.virtualObjects
    });

    this.emit("quota", {
      hiveId: this.hiveId,
      tick,
      quota
    });
  }

  /**
   * Convenience method to publish metrics to console for debugging.
   */
  publishHiveMetricsToConsole(metrics) {
    const line = `[HoneyWellBees][${this.hiveId}] tick=${metrics.tick ?? "n/a"} band=${metrics.band ?? "?"} bioload=${metrics.bioload ?? "?"}`;
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export default JetsonEdgeGateway;
