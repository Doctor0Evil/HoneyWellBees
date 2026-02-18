use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MultiSigApproval {
    pub technical_sig_hex: String,
    pub ecological_sig_hex: String,
    pub legal_sig_hex: String,
}

impl MultiSigApproval {
    pub fn is_complete(&self) -> bool {
        !self.technical_sig_hex.is_empty()
            && !self.ecological_sig_hex.is_empty()
            && !self.legal_sig_hex.is_empty()
    }
}
