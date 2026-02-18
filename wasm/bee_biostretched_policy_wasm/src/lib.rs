use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn compile_bundle(input: JsValue) -> Result<JsValue, JsValue> {
    bee_biostretched_policy::wasm_api::compile_policy_wasm(input)
}
