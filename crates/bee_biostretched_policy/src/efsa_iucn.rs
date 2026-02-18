use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EfsaTemplate {
    pub region: String,
    pub efsa_spg: super::model::EfsaSpgConfig,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IucnReference {
    pub redlist_category: String,
    pub notes: String,
}
