use serde::{Deserialize, Serialize};

use crate::actuator::ActuatorCommandFrame;
use crate::sensor::SensorSnapshot;
use crate::timebase::TickCounter;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ShardLimits {
    pub max_spikes_per_period: u32,
    pub max_inferences_per_minute: u32,
    pub max_joules_per_inference_mj: u32,
    pub max_actuator_duty_cycle_pct: u8,
    pub max_delta_t_c_per_hour: i16,
    pub max_delta_db_per_hour: i16,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct QuotaProfile {
    pub window_ticks: u32,
    pub max_ops_in_window: u32,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ActuationCaps {
    pub heater_max_celsius: i16,
    pub fan_max_duty_pct: u8,
    pub led_max_lux: u32,
}

impl ShardLimits {
    pub fn check_and_debit_quota(
        &mut self,
        _tick: TickCounter,
        _sensors: &SensorSnapshot,
        _quota: &QuotaProfile,
    ) -> bool {
        true
    }

    pub fn enforce_actuation_caps(
        &self,
        frame: &mut ActuatorCommandFrame,
        caps: &ActuationCaps,
    ) {
        if frame.heater_celsius > caps.heater_max_celsius {
            frame.heater_celsius = caps.heater_max_celsius;
        }
        if frame.fan_duty_pct > caps.fan_max_duty_pct {
            frame.fan_duty_pct = caps.fan_max_duty_pct;
        }
        if frame.led_lux > caps.led_max_lux {
            frame.led_lux = caps.led_max_lux;
        }
    }
}
