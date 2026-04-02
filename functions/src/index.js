const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

// QuickBooks OAuth endpoints
const { authUri, callback, disconnect } = require("./quickbooks/auth");
const { refreshToken } = require("./quickbooks/tokens");

// OAuth flow: redirects admin to QuickBooks authorization page
exports.qbAuth = onRequest(authUri);

// OAuth callback: QuickBooks redirects here after admin approves
exports.qbCallback = onRequest(callback);

// Disconnect: revokes tokens and cleans up
exports.qbDisconnect = onRequest(disconnect);

// Token refresh: called automatically or manually to refresh access token
exports.qbRefreshToken = onRequest(refreshToken);

// Webhook: receives notifications from QuickBooks (invoice changes, etc.)
const { handleWebhook } = require("./quickbooks/webhooks");
exports.qbWebhook = onRequest(handleWebhook);
