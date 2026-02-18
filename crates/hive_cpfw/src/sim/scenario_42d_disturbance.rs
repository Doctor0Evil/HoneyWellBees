use crate::enforcer::Enforcer;
use crate::policy::CpPolicy;
use crate::request::{ActuationRequest, ActuationType};
use crate::state::BandStateSnapshot;

pub fn run_simulation() {
    let policy = CpPolicy {
        max_heater_celsius: 35,
        max_fan_duty_pct: 60,
        max_led_lux: 1000,
        max_delta_t_c_per_hour: 1,
        max_delta_db_per_hour: 3,
    };
    let enforcer = Enforcer::new(policy);
    let band_state = BandStateSnapshot {
        band: "green".into(),
        bioload: "nominal".into(),
    };
    for day in 0..42 {
        let req = ActuationRequest {
            hive_id: "sim-hive".into(),
            actuator: ActuationType::Heater,
            magnitude: 30,
            duration_ms: 1000,
            location: "brood".into(),
            requested_at_ms: day * 86400000,
        };
        let _decision = enforcer.decide(req, &band_state);
    }
}
