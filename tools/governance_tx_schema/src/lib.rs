use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum GovernanceTxKind {
    PolicyBundleCreated,
    PolicyBundleActivated,
    CpEnforcerUpdated,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GovernanceTransaction {
    pub id: String,
    pub kind: GovernanceTxKind,
    pub payload_json: String,
    pub created_at: OffsetDateTime,
    pub prev_hash_hex: String,
}
