use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BandStateSnapshot {
    pub band: String,
    pub bioload: String,
}
