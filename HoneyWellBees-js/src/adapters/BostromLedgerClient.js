import https from "node:https";

/**
 * BostromLedgerClient
 * - Designed for simple JSON-over-HTTP interactions with a cosmos-style REST API.
 * - You can point baseUrl to lcd.bostrom.cybernode.ai or a compatible endpoint.
 */
export class BostromLedgerClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || "https://lcd.bostrom.cybernode.ai";
    this.chainId = options.chainId || "bostrom";
    this.address = options.address || "bostrom1ldgmtf20d6604a24ztr0jxht7xt7az4jhkmsrc";
  }

  /**
   * Fetch the latest policy bundle tx for a hive, if stored as a governance tx.
   * This is a thin wrapper; actual query routes depend on your chain indexing.
   */
  fetchHivePolicyFromBostrom(hiveId) {
    const path = `/cosmos/tx/v1beta1/txs?events=message.action='honeywellbees_policy'&events=honeywellbees.hive_id='${encodeURIComponent(
      hiveId
    )}'`;

    return this._getJson(path).then((res) => {
      const txs = res.tx_responses || [];
      if (!txs.length) return null;

      const latest = txs[0];
      try {
        const msg = latest.tx.body.messages[0];
        const bundleJson = msg.bundle_json || "{}";
        return JSON.parse(bundleJson);
      } catch {
        return null;
      }
    });
  }

  /**
   * Submit a governance tx payload for HoneyWellBees (pseudo-offline; no signing here).
   * In a real deployment, signing and broadcast happen via wallet/daemon.
   */
  submitGovernanceTxToBostrom(txPayload) {
    const body = JSON.stringify({
      type: "honeywellbees/MsgSubmitGovernance",
      value: {
        creator: this.address,
        chain_id: this.chainId,
        payload_json: JSON.stringify(txPayload)
      }
    });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    };

    return this._requestJson("/honeywellbees/governance", options, body);
  }

  _getJson(path) {
    const url = this.baseUrl + path;
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            try {
              const text = Buffer.concat(chunks).toString("utf8");
              const json = JSON.parse(text);
              resolve(json);
            } catch (e) {
              reject(e);
            }
          });
        })
        .on("error", reject);
    });
  }

  _requestJson(path, options, body) {
    const url = new URL(this.baseUrl + path);
    const requestOptions = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      protocol: url.protocol,
      port: url.port || 443,
      ...options
    };

    return new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          try {
            const text = Buffer.concat(chunks).toString("utf8");
            const json = JSON.parse(text || "{}");
            resolve(json);
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on("error", reject);
      if (body) req.write(body);
      req.end();
    });
  }
}

export default BostromLedgerClient;
