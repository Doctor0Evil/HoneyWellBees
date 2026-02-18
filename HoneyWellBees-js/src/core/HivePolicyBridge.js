import fs from "node:fs";
import path from "node:path";

/**
 * Load a HivePolicyBundle from a JSON file path or from a JSON object.
 * The shape is aligned with the Rust bee_biostretched_policy bundle.
 */
export function loadHivePolicyBundle(pathOrJson) {
  if (typeof pathOrJson === "string") {
    const abs = path.isAbsolute(pathOrJson)
      ? pathOrJson
      : path.join(process.cwd(), pathOrJson);
    const raw = fs.readFileSync(abs, "utf8");
    return JSON.parse(raw);
  }
  if (!pathOrJson || typeof pathOrJson !== "object") {
    throw new Error("loadHivePolicyBundle: argument must be a path string or JSON object.");
  }
  return pathOrJson;
}

/**
 * Derive CPFW-friendly actuation caps from a HivePolicyBundle.
 * This mirrors the Rust bundle_to_cp_policy logic, but keeps units explicit.
 */
export function deriveHiveActuationCaps(policyBundle) {
  if (!policyBundle || typeof policyBundle !== "object" || !policyBundle.policy) {
    throw new Error("deriveHiveActuationCaps: invalid policy bundle.");
  }
  const p = policyBundle.policy;

  const baselineTemp = p.baseline?.baseline_brood_temp_c ?? 34;
  const maxColonyLoss = p.efsa_spg?.max_colony_strength_loss_pct ?? 10;
  const maxDailyMortality = p.efsa_spg?.max_daily_mortality_pct ?? 5;
  const maxMites = p.efsa_spg?.max_mites_per_100_bees ?? 3;

  // Simple, conservative envelopes derived from EFSA-like SPGs.
  const maxHeaterDeltaC = 2;
  const maxFanDutyPct = maxColonyLoss > 15 ? 70 : 60;
  const maxLedLux = 800;

  return {
    cpPolicy: {
      max_heater_celsius: baselineTemp + maxHeaterDeltaC,
      max_fan_duty_pct: maxFanDutyPct,
      max_led_lux: maxLedLux,
      max_delta_t_c_per_hour: 1,
      max_delta_db_per_hour: 3
    },
    derivedFrom: {
      maxColonyStrengthLossPct: maxColonyLoss,
      maxDailyMortalityPct: maxDailyMortality,
      maxMitesPer100Bees: maxMites
    }
  };
}

export default {
  loadHivePolicyBundle,
  deriveHiveActuationCaps
};
