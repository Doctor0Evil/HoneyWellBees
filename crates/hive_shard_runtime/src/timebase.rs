#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum FailsafeMode {
    Normal,
    ObservationOnly,
}

impl FailsafeMode {
    pub fn is_observation_only(&self) -> bool {
        matches!(self, FailsafeMode::ObservationOnly)
    }
}
