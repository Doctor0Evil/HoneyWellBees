use std::fs;
use std::path::PathBuf;

use clap::Parser;
use serde_yaml;

use crate::compiler::PolicyCompiler;
use crate::model::{EfsaSpgConfig, SiteBaseline, TemporalEnvelope};
use crate::bundle::HivePolicyBundle;

#[derive(Parser, Debug)]
#[command(name = "bee-policyc")]
pub struct Cli {
    #[arg(short = 'i', long = "input")]
    pub input: PathBuf,
    #[arg(short = 'o', long = "output")]
    pub output: PathBuf,
    #[arg(long = "hive-id")]
    pub hive_id: String,
}

pub fn run() -> anyhow::Result<()> {
    let cli = Cli::parse();
    let contents = fs::read_to_string(&cli.input)?;
    let v: serde_yaml::Value = serde_yaml::from_str(&contents)?;

    let efsa_spg: EfsaSpgConfig =
        serde_yaml::from_value(v.get("efsa_spg").cloned().unwrap())?;
    let baseline: SiteBaseline =
        serde_yaml::from_value(v.get("baseline").cloned().unwrap())?;
    let temporal: TemporalEnvelope =
        serde_yaml::from_value(v.get("temporal").cloned().unwrap())?;

    let bundle: HivePolicyBundle =
        PolicyCompiler::compile(&cli.hive_id, efsa_spg, baseline, temporal);
    let json = serde_json::to_string_pretty(&bundle)?;
    fs::write(&cli.output, json)?;
    Ok(())
}
