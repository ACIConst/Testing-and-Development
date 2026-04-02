const { getValidToken } = require("./tokens");
const { defineString } = require("firebase-functions/params");

const QB_ENVIRONMENT = defineString("QB_ENVIRONMENT");

function getBaseUrl() {
  return QB_ENVIRONMENT.value() === "production"
    ? "https://quickbooks.api.intuit.com/v3/company"
    : "https://sandbox-quickbooks.api.intuit.com/v3/company";
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
    throw new Error(`QB API GET ${endpoint} failed (${res.status}): ${body}`);
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
    throw new Error(`QB API POST ${endpoint} failed (${res.status}): ${errBody}`);
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
