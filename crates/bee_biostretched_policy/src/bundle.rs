use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::model::HivePolicy;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HivePolicyBundle {
    pub policy: HivePolicy,
    pub version: u32,
    pub created_at: OffsetDateTime,
    pub signature_hex: String,
}

impl HivePolicyBundle {
    pub fn new(policy: HivePolicy) -> Self {
        let now = OffsetDateTime::now_utc();
        let signature_hex = "00".repeat(32);
        Self {
            policy,
            version: 1,
            created_at: now,
            signature_hex,
        }
    }
}
