use serde::{Deserialize, Serialize};

use crate::sensor::SensorSnapshot;

#[derive(Copy, Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub enum BandState {
    Green,
    Yellow,
    Red,
}

impl BandState {
    pub fn is_red(&self) -> bool {
        matches!(self, BandState::Red)
    }

    pub fn evaluate(
        &self,
        snapshot: &SensorSnapshot,
        thresholds: &BandThresholds,
    ) -> BandState {
        if snapshot.brood_temp_c < thresholds.red_min_temp_c
            || snapshot.brood_temp_c > thresholds.red_max_temp_c
            || snapshot.brood_humidity_pct < thresholds.red_min_humidity_pct
            || snapshot.brood_humidity_pct > thresholds.red_max_humidity_pct
            || snapshot.acoustic_surplus_db > thresholds.red_max_acoustic_surplus_db
            || snapshot.daily_mortality_pct > thresholds.red_max_daily_mortality_pct
        {
            BandState::Red
        } else if snapshot.brood_temp_c < thresholds.yellow_min_temp_c
            || snapshot.brood_temp_c > thresholds.yellow_max_temp_c
            || snapshot.brood_humidity_pct < thresholds.yellow_min_humidity_pct
            || snapshot.brood_humidity_pct > thresholds.yellow_max_humidity_pct
            || snapshot.acoustic_surplus_db > thresholds.yellow_max_acoustic_surplus_db
            || snapshot.daily_mortality_pct > thresholds.yellow_max_daily_mortality_pct
        {
            BandState::Yellow
        } else {
            BandState::Green
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BandThresholds {
    pub yellow_min_temp_c: i16,
    pub yellow_max_temp_c: i16,
    pub red_min_temp_c: i16,
    pub red_max_temp_c: i16,
    pub yellow_min_humidity_pct: u8,
    pub yellow_max_humidity_pct: u8,
    pub red_min_humidity_pct: u8,
    pub red_max_humidity_pct: u8,
    pub yellow_max_acoustic_surplus_db: i16,
    pub red_max_acoustic_surplus_db: i16,
    pub yellow_max_daily_mortality_pct: u8,
    pub red_max_daily_mortality_pct: u8,
}

#[derive(Copy, Clone, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub enum BioloadState {
    Nominal,
    Elevated,
    Critical,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BioloadThresholds {
    pub elevated_mites_per_100_bees: u8,
    pub critical_mites_per_100_bees: u8,
}

impl BioloadState {
    pub fn from_snapshot(
        snapshot: &SensorSnapshot,
        thresholds: &BioloadThresholds,
    ) -> BioloadState {
        if snapshot.varroa_mites_per_100_bees >= thresholds.critical_mites_per_100_bees {
            BioloadState::Critical
        } else if snapshot.varroa_mites_per_100_bees
            >= thresholds.elevated_mites_per_100_bees
        {
            BioloadState::Elevated
        } else {
            BioloadState::Nominal
        }
    }

    pub fn is_critical(&self) -> bool {
        matches!(self, BioloadState::Critical)
    }
}
