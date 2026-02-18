use super::{fan::FanBackend, heater::HeaterBackend, led::LedBackend};

pub struct MockHeater;
pub struct MockFan;
pub struct MockLed;

impl HeaterBackend for MockHeater {
    fn set_celsius(&mut self, _celsius: i16) {}
}

impl FanBackend for MockFan {
    fn set_duty_pct(&mut self, _duty: u8) {}
}

impl LedBackend for MockLed {
    fn set_lux(&mut self, _lux: u32) {}
}
