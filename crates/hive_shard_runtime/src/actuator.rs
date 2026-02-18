use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ActuatorCommandFrame {
    pub heater_celsius: i16,
    pub fan_duty_pct: u8,
    pub led_lux: u32,
}

impl ActuatorCommandFrame {
    pub fn observation_only() -> Self {
        Self {
            heater_celsius: 0,
            fan_duty_pct: 0,
            led_lux: 0,
        }
    }
}
