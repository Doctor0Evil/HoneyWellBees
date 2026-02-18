import crypto from "node:crypto";

/**
 * @typedef {Object} ActuationRequest
 * @property {string} hiveId
 * @property {"Heater"|"Fan"|"Led"} actuator
 * @property {number} magnitude
 * @property {number} durationMs
 * @property {string} location
 * @property {number} requestedAtMs
 */

/**
 * @typedef {Object} CpPolicy
 * @property {number} max_heater_celsius
 * @property {number} max_fan_duty_pct
 * @property {number} max_led_lux
 * @property {number} max_delta_t_c_per_hour
 * @property {number} max_delta_db_per_hour
 */

/**
 * @typedef {Object} BandStateSnapshot
 * @property {string} band   // "green" | "yellow" | "red"
 * @property {string} bioload // "nominal" | "elevated" | "critical"
 */

/**
 * @typedef {Object} ActuationDecision
 * @property {"Allow"|"Modify"|"Deny"} kind
 * @property {string} reason
 * @property {ActuationRequest} request
 * @property {number} modifiedMagnitude
 * @property {string} decisionId
 */

export function enforceActuationPolicy(requests, bandState, cpPolicy) {
  if (!Array.isArray(requests)) {
    throw new Error("enforceActuationPolicy: requests must be an array.");
  }
  validateBandState(bandState);
  validateCpPolicy(cpPolicy);

  const decisions = [];
  for (const req of requests) {
    const decision = decideSingle(req, bandState, cpPolicy);
    decisions.push(decision);
  }
  return decisions;
}

function decideSingle(req, bandState, cpPolicy) {
  validateRequest(req);

  const baseId = genDecisionId(req);
  const band = (bandState.band || "").toLowerCase();
  const bioload = (bandState.bioload || "").toLowerCase();

  if (band === "red" || bioload === "critical") {
    return {
      kind: "Deny",
      reason: "band_or_bioload_red",
      request: req,
      modifiedMagnitude: 0,
      decisionId: baseId + "-deny-red"
    };
  }

  if (req.magnitude < 0) {
    return {
      kind: "Deny",
      reason: "negative_magnitude",
      request: req,
      modifiedMagnitude: 0,
      decisionId: baseId + "-deny-negative"
    };
  }

  let cappedMagnitude = req.magnitude;
  let reason = "within_limits";

  if (req.actuator === "Heater") {
    cappedMagnitude = Math.min(cappedMagnitude, cpPolicy.max_heater_celsius);
  } else if (req.actuator === "Fan") {
    cappedMagnitude = Math.min(cappedMagnitude, cpPolicy.max_fan_duty_pct);
  } else if (req.actuator === "Led") {
    cappedMagnitude = Math.min(cappedMagnitude, cpPolicy.max_led_lux);
  }

  if (cappedMagnitude < req.magnitude) {
    return {
      kind: "Modify",
      reason: "capped_to_policy_limit",
      request: req,
      modifiedMagnitude: cappedMagnitude,
      decisionId: baseId + "-modify-cap"
    };
  }

  return {
    kind: "Allow",
    reason,
    request: req,
    modifiedMagnitude: req.magnitude,
    decisionId: baseId + "-allow"
  };
}

/**
 * Create a hash-linked decision log entry for a decision.
 * @param {ActuationDecision} decision
 * @param {BandStateSnapshot} bandState
 * @param {string} prevHashHex
 */
export function logFirewallDecision(decision, bandState, prevHashHex = "") {
  const payload = {
    decision,
    bandState,
    prevHashHex,
    timestamp: new Date().toISOString()
  };
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  return {
    id: hash.slice(0, 16),
    hashHex: hash,
    payload
  };
}

function validateRequest(req) {
  if (!req || typeof req !== "object") {
    throw new Error("HiveActuationFirewall: request must be an object.");
  }
  if (!req.hiveId || typeof req.hiveId !== "string") {
    throw new Error("HiveActuationFirewall: request.hiveId must be a string.");
  }
  if (!["Heater", "Fan", "Led"].includes(req.actuator)) {
    throw new Error("HiveActuationFirewall: invalid actuator type.");
  }
  if (typeof req.magnitude !== "number" || Number.isNaN(req.magnitude)) {
    throw new Error("HiveActuationFirewall: magnitude must be a number.");
  }
  if (typeof req.durationMs !== "number" || req.durationMs <= 0) {
    throw new Error("HiveActuationFirewall: durationMs must be a positive number.");
  }
}

function validateBandState(bandState) {
  if (!bandState || typeof bandState !== "object") {
    throw new Error("HiveActuationFirewall: bandState must be an object.");
  }
}

function validateCpPolicy(cpPolicy) {
  const keys = [
    "max_heater_celsius",
    "max_fan_duty_pct",
    "max_led_lux",
    "max_delta_t_c_per_hour",
    "max_delta_db_per_hour"
  ];
  for (const k of keys) {
    if (typeof cpPolicy[k] !== "number" || Number.isNaN(cpPolicy[k])) {
      throw new Error(`HiveActuationFirewall: cpPolicy.${k} must be a number.`);
    }
  }
}

function genDecisionId(req) {
  const base = `${req.hiveId}-${req.actuator}-${req.requestedAtMs}`;
  return crypto.createHash("sha256").update(base).digest("hex").slice(0, 16);
}

export default {
  enforceActuationPolicy,
  logFirewallDecision
};
