const { getValidToken } = require("./tokens");
const { defineString } = require("firebase-functions/params");

const QB_ENVIRONMENT = defineString("QB_ENVIRONMENT");

function getBaseUrl() {
  return QB_ENVIRONMENT.value() === "production"
    ? "https://quickbooks.api.intuit.com/v3/company"
    : "https://sandbox-quickbooks.api.intuit.com/v3/company";
}

/**
 * Build a QB API error with intuit_tid for Intuit's support/assessment requirements.
 * intuit_tid is a transaction ID that Intuit uses to trace API calls in their system.
 */
function buildQBError(method, endpoint, res, body) {
  const intuitTid = res.headers.get("intuit_tid") || "unknown";
  const msg = `QB API ${method} ${endpoint} failed (${res.status}) [intuit_tid: ${intuitTid}]: ${body}`;
  console.error(msg);
  const err = new Error(msg);
  err.intuit_tid = intuitTid;
  err.statusCode = res.status;
  return err;
}

/**
 * Make a GET request to the QuickBooks API.
 * @param {string} endpoint - e.g., "companyinfo/12345" or "query?query=SELECT..."
 */
async function qbGet(endpoint) {
  const { accessToken, realmId } = await getValidToken();
  const url = `${getBaseUrl()}/${realmId}/${endpoint}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw buildQBError("GET", endpoint, res, body);
  }
  return res.json();
}

/**
 * Make a POST request to the QuickBooks API.
 * @param {string} endpoint - e.g., "invoice" or "customer"
 * @param {object} body - JSON body to send
 */
async function qbPost(endpoint, body) {
  const { accessToken, realmId } = await getValidToken();
  const url = `${getBaseUrl()}/${realmId}/${endpoint}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw buildQBError("POST", endpoint, res, errBody);
  }
  return res.json();
}

/**
 * Run a QuickBooks query (SQL-like).
 * @param {string} query - e.g., "SELECT * FROM Item WHERE Type = 'Inventory'"
 */
async function qbQuery(query) {
  const encoded = encodeURIComponent(query);
  return qbGet(`query?query=${encoded}`);
}

module.exports = { qbGet, qbPost, qbQuery };
