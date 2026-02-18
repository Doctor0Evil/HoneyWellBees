use ed25519_dalek::{Signature, SigningKey};
use rand_core::OsRng;

pub struct BundleSigner {
    signing_key: SigningKey,
}

impl BundleSigner {
    pub fn generate() -> Self {
        let signing_key = SigningKey::generate(&mut OsRng);
        Self { signing_key }
    }

    pub fn sign(&self, payload: &[u8]) -> Signature {
        self.signing_key.sign(payload)
    }
}
