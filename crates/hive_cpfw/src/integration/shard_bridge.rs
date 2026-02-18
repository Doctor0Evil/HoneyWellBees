use hive_shard_runtime::actuator::ActuatorCommandFrame;
use hive_shard_runtime::sensor::SensorSnapshot;

use crate::request::{ActuationRequest, ActuationType};

pub fn frame_to_requests(
    hive_id: &str,
    frame: &ActuatorCommandFrame,
    snapshot_ms: u64,
) -> Vec<ActuationRequest> {
    let mut out = Vec::new();
    if frame.heater_celsius != 0 {
        out.push(ActuationRequest {
            hive_id: hive_id.to_string(),
            actuator: ActuationType::Heater,
            magnitude: frame.heater_celsius as i32,
            duration_ms: 1000,
            location: "brood".into(),
            requested_at_ms: snapshot_ms,
        });
    }
    if frame.fan_duty_pct != 0 {
        out.push(ActuationRequest {
            hive_id: hive_id.to_string(),
            actuator: ActuationType::Fan,
            magnitude: frame.fan_duty_pct as i32,
            duration_ms: 1000,
            location: "brood".into(),
            requested_at_ms: snapshot_ms,
        });
    }
    if frame.led_lux != 0 {
        out.push(ActuationRequest {
            hive_id: hive_id.to_string(),
            actuator: ActuationType::Led,
            magnitude: frame.led_lux as i32,
            duration_ms: 1000,
            location: "entrance".into(),
            requested_at_ms: snapshot_ms,
        });
    }
    out
}

pub fn sensors_to_band_state(snapshot: &SensorSnapshot) -> crate::state::BandStateSnapshot {
    crate::state::BandStateSnapshot {
        band: "green".into(),
        bioload: "nominal".into(),
    }
}
