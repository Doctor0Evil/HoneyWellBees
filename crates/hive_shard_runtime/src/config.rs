use serde::{Deserialize, Serialize};

use crate::band::{BandThresholds, BioloadThresholds};
use crate::limits::{ActuationCaps, QuotaProfile, ShardLimits};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ShardConfig {
    pub limits: ShardLimits,
    pub bands: BandThresholds,
    pub bioload_thresholds: BioloadThresholds,
    pub quota_profile: QuotaProfile,
    pub actuation_caps: ActuationCaps,
}
