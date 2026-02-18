use wasm_bindgen::prelude::*;

use crate::bundle::HivePolicyBundle;
use crate::compiler::PolicyCompiler;
use crate::model::{EfsaSpgConfig, SiteBaseline, TemporalEnvelope};

#[wasm_bindgen]
pub fn compile_policy_wasm(input: JsValue) -> Result<JsValue, JsValue> {
    let input: serde_json::Value =
        input.into_serde().map_err(|e| JsValue::from_str(&e.to_string()))?;
    let hive_id = input
        .get("hive_id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| JsValue::from_str("missing hive_id"))?;
    let efsa_spg: EfsaSpgConfig = serde_json::from_value(
        input
            .get("efsa_spg")
            .cloned()
            .ok_or_else(|| JsValue::from_str("missing efsa_spg"))?,
    )
    .map_err(|e| JsValue::from_str(&e.to_string()))?;
    let baseline: SiteBaseline = serde_json::from_value(
        input
            .get("baseline")
            .cloned()
            .ok_or_else(|| JsValue::from_str("missing baseline"))?,
    )
    .map_err(|e| JsValue::from_str(&e.to_string()))?;
    let temporal: TemporalEnvelope = serde_json::from_value(
        input
            .get("temporal")
            .cloned()
            .ok_or_else(|| JsValue::from_str("missing temporal"))?,
    )
    .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let bundle: HivePolicyBundle =
        PolicyCompiler::compile(hive_id, efsa_spg, baseline, temporal);
    JsValue::from_serde(&bundle).map_err(|e| JsValue::from_str(&e.to_string()))
}
