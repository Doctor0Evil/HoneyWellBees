use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::decision::ActuationDecision;
use crate::state::BandStateSnapshot;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct DecisionLogEntry {
    pub id: String,
    pub timestamp: OffsetDateTime,
    pub decision: ActuationDecision,
    pub band_state: BandStateSnapshot,
    pub hash_prev_hex: String,
}
