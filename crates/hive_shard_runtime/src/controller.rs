use crate::actuator::ActuatorCommandFrame;
use crate::sensor::SensorSnapshot;

pub trait NeuromorphicController {
    fn step_neuromorphic(
        &mut self,
        sensors: &SensorSnapshot,
    ) -> ActuatorCommandFrame;
}
