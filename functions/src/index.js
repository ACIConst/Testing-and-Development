const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

// QuickBooks OAuth endpoints
const { authUri, callback, disconnect } = require("./quickbooks/auth");
const { refreshToken } = require("./quickbooks/tokens");

// Allow unauthenticated access — these are public HTTP endpoints
const publicOpts = { invoker: "public" };

// OAuth flow: redirects admin to QuickBooks authorization page
exports.qbAuth = onRequest(publicOpts, authUri);

// OAuth callback: QuickBooks redirects here after admin approves
exports.qbCallback = onRequest(publicOpts, callback);

// Disconnect: revokes tokens and cleans up
exports.qbDisconnect = onRequest(publicOpts, disconnect);

// Token refresh: called automatically or manually to refresh access token
exports.qbRefreshToken = onRequest(publicOpts, refreshToken);

// Webhook: receives notifications from QuickBooks (invoice changes, etc.)
const { handleWebhook } = require("./quickbooks/webhooks");
exports.qbWebhook = onRequest(publicOpts, handleWebhook);
