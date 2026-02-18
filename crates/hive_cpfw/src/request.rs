use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ActuationType {
    Heater,
    Fan,
    Led,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ActuationRequest {
    pub hive_id: String,
    pub actuator: ActuationType,
    pub magnitude: i32,
    pub duration_ms: u32,
    pub location: String,
    pub requested_at_ms: u64,
}
