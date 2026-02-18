use bee_biostretched_policy::HivePolicyBundle;

use crate::policy::CpPolicy;

pub fn bundle_to_cp_policy(bundle: &HivePolicyBundle) -> CpPolicy {
    let p = &bundle.policy;
    CpPolicy {
        max_heater_celsius: p.baseline.baseline_brood_temp_c + 2,
        max_fan_duty_pct: 60,
        max_led_lux: 800,
        max_delta_t_c_per_hour: 1,
        max_delta_db_per_hour: 3,
    }
}
