use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GovernanceTransaction {
    pub id: String,
    pub bundle_hash_hex: String,
    pub payload: JsonValue,
}
