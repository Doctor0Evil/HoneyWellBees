use serde::{Deserialize, Serialize};

use crate::request::ActuationRequest;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum DecisionKind {
    Allow,
    Modify,
    Deny,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ActuationDecision {
    pub request: ActuationRequest,
    pub kind: DecisionKind,
    pub reason: String,
    pub modified_magnitude: i32,
}
