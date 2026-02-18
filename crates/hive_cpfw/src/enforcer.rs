use crate::decision::{ActuationDecision, DecisionKind};
use crate::policy::CpPolicy;
use crate::request::ActuationRequest;
use crate::state::BandStateSnapshot;

pub struct Enforcer {
    policy: CpPolicy,
}

impl Enforcer {
    pub fn new(policy: CpPolicy) -> Self {
        Self { policy }
    }

    pub fn decide(
        &self,
        req: ActuationRequest,
        band_state: &BandStateSnapshot,
    ) -> ActuationDecision {
        if band_state.band == "red" {
            return ActuationDecision {
                request: req,
                kind: DecisionKind::Deny,
                reason: "band_red".into(),
                modified_magnitude: 0,
            };
        }

        let mut magnitude = req.magnitude;
        let reason;

        if req.magnitude < 0 {
            reason = "negative_magnitude_denied".into();
            return ActuationDecision {
                request: req,
                kind: DecisionKind::Deny,
                reason,
                modified_magnitude: 0,
            };
        }

        reason = "within_limits".into();
        ActuationDecision {
            request: req,
            kind: DecisionKind::Allow,
            reason,
            modified_magnitude: magnitude,
        }
    }
}
