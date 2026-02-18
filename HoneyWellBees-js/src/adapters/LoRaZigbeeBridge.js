/**
 * Encode a minimal hive frame into a compact JSON string suitable for LoRa/Zigbee payloads.
 * @param {object} frame - { hiveId, tick, band, bioload, heater, fan, led }
 */
export function encodeHiveFrameForLoRa(frame) {
  if (!frame || typeof frame !== "object") {
    throw new Error("encodeHiveFrameForLoRa: frame must be an object.");
  }

  const payload = {
    h: frame.hiveId || "h",
    t: frame.tick ?? 0,
    b: frame.band || "g",
    l: frame.bioload || "n",
    H: Math.round(frame.heater ?? 0),
    F: Math.round(frame.fan ?? 0),
    L: Math.round(frame.led ?? 0)
  };

  return JSON.stringify(payload);
}

/**
 * Decode a LoRa/Zigbee JSON payload into a high-level hive frame.
 * @param {string|Buffer} payload
 */
export function decodeHiveFrameFromLoRa(payload) {
  const text = Buffer.isBuffer(payload) ? payload.toString("utf8") : String(payload);
  const data = JSON.parse(text);

  return {
    hiveId: data.h,
    tick: data.t,
    band: data.b,
    bioload: data.l,
    heater: data.H,
    fan: data.F,
    led: data.L
  };
}

export default {
  encodeHiveFrameForLoRa,
  decodeHiveFrameFromLoRa
};
