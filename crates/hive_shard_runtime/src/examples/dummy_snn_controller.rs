use hive_shard_runtime::actuator::ActuatorCommandFrame;
use hive_shard_runtime::controller::NeuromorphicController;
use hive_shard_runtime::sensor::SensorSnapshot;

pub struct DummySnnController;

impl NeuromorphicController for DummySnnController {
    fn step_neuromorphic(
        &mut self,
        _sensors: &SensorSnapshot,
    ) -> ActuatorCommandFrame {
        ActuatorCommandFrame {
            heater_celsius: 0,
            fan_duty_pct: 0,
            led_lux: 0,
        }
    }
}
