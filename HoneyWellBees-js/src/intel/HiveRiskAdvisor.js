/**
 * Assess hive risk over a rolling 72h window.
 * @param {Array<object>} series72h - ordered list of band snapshots with metrics.
 *   Each item: { timestamp, band: "green"|"yellow"|"red", bioload: "nominal"|"elevated"|"critical" }
 */
export function assessHiveRiskWindow(series72h) {
  if (!Array.isArray(series72h) || series72h.length === 0) {
    throw new Error("assessHiveRiskWindow: series72h must be a non-empty array.");
  }

  let green = 0;
  let yellow = 0;
  let red = 0;
  let elevatedBioload = 0;
  let criticalBioload = 0;

  for (const s of series72h) {
    const band = (s.band || "").toLowerCase();
    const bio = (s.bioload || "").toLowerCase();
    if (band === "green") green += 1;
    if (band === "yellow") yellow += 1;
    if (band === "red") red += 1;
    if (bio === "elevated") elevatedBioload += 1;
    if (bio === "critical") criticalBioload += 1;
  }

  const total = series72h.length;
  const pctYellow = total ? yellow / total : 0;
  const pctRed = total ? red / total : 0;

  let riskLevel = "low";
  const reasons = [];

  if (pctRed > 0 || criticalBioload > 0) {
    riskLevel = "severe";
    reasons.push("Red band or critical bioload periods detected.");
  } else if (pctYellow > 0.2 || elevatedBioload > 0) {
    riskLevel = "moderate";
    reasons.push("Extended yellow band or elevated bioload.");
  } else {
    reasons.push("Bands mostly green and bioload nominal.");
  }

  return {
    riskLevel,
    stats: {
      totalSamples: total,
      green,
      yellow,
      red,
      elevatedBioload,
      criticalBioload,
      pctYellow,
      pctRed
    },
    reasons
  };
}

/**
 * Suggest conservative cooldown actions based on recent band history.
 * @param {Array<object>} bandHistory - recent band snapshots (most recent last).
 */
export function suggestCooldownActions(bandHistory) {
  if (!Array.isArray(bandHistory) || bandHistory.length === 0) {
    throw new Error("suggestCooldownActions: bandHistory must be a non-empty array.");
  }

  const last = bandHistory[bandHistory.length - 1];
  const band = (last.band || "").toLowerCase();
  const bioload = (last.bioload || "").toLowerCase();

  const actions = [];

  if (band === "red" || bioload === "critical") {
    actions.push("Force observation-only mode for at least 24 hours.");
    actions.push("Suspend all non-essential heating, cooling, and lighting.");
    actions.push("Notify human operator for veterinary inspection.");
  } else if (band === "yellow" || bioload === "elevated") {
    actions.push("Reduce maximum heater and fan duty cycles by 25%.");
    actions.push("Lower allowed LED lux ceiling near brood frames.");
    actions.push("Increase telemetry sampling to refine band estimation.");
  } else {
    actions.push("Maintain current conservative envelopes.");
    actions.push("Keep actuation ceilings as per policy bundle.");
  }

  return {
    band,
    bioload,
    actions
  };
}

export default {
  assessHiveRiskWindow,
  suggestCooldownActions
};
