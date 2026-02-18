use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct SensorSnapshot {
    pub brood_temp_c: i16,
    pub brood_humidity_pct: u8,
    pub acoustic_surplus_db: i16,
    pub daily_mortality_pct: u8,
    pub hive_weight_kg_x10: i32,
    pub forager_return_delta_pct: i16,
    pub varroa_mites_per_100_bees: u8,
}
