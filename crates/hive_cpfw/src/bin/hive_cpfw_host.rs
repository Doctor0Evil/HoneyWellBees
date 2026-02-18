use hive_cpfw::enforcer::Enforcer;
use hive_cpfw::integration::{bundle_to_cp_policy, shard_bridge};
use hive_cpfw::state::BandStateSnapshot;

fn main() {
    let dummy_bundle = bee_biostretched_policy::bundle::HivePolicyBundle::new(
        bee_biostretched_policy::model::HivePolicy {
            hive_id: "host-hive".into(),
            efsa_spg: bee_biostretched_policy::model::EfsaSpgConfig {
                max_colony_strength_loss_pct: 10,
                max_daily_mortality_pct: 5,
                max_mites_per_100_bees: 3,
            },
            baseline: bee_biostretched_policy::model::SiteBaseline {
                location_id: "site-1".into(),
                climate_zone: "arid".into(),
                strain: "local".into(),
                baseline_brood_temp_c: 34,
                baseline_brood_humidity_pct: 60,
                baseline_acoustic_db: 40,
            },
            temporal: bee_biostretched_policy::model::TemporalEnvelope {
                max_hours_in_yellow_per_72h: 6,
            },
        },
    );

    let cp_policy = bundle_to_cp_policy(&dummy_bundle);
    let enforcer = Enforcer::new(cp_policy);

    let frame = hive_shard_runtime::actuator::ActuatorCommandFrame {
        heater_celsius: 2,
        fan_duty_pct: 10,
        led_lux: 0,
    };
    let snapshots = shard_bridge::frame_to_requests("host-hive", &frame, 0);
    let band_state = BandStateSnapshot {
        band: "green".into(),
        bioload: "nominal".into(),
    };

    for req in snapshots {
        let decision = enforcer.decide(req, &band_state);
        let _ = decision;
    }
}
