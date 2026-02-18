use crate::bundle::HivePolicyBundle;
use crate::model::{EfsaSpgConfig, HivePolicy, SiteBaseline, TemporalEnvelope};

pub struct PolicyCompiler;

impl PolicyCompiler {
    pub fn compile(
        hive_id: &str,
        efsa_spg: EfsaSpgConfig,
        baseline: SiteBaseline,
        temporal: TemporalEnvelope,
    ) -> HivePolicyBundle {
        let policy = HivePolicy {
            hive_id: hive_id.to_string(),
            efsa_spg,
            baseline,
            temporal,
        };
        HivePolicyBundle::new(policy)
    }
}
