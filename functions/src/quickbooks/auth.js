const OAuthClient = require("intuit-oauth");
const { getFirestore } = require("firebase-admin/firestore");
const { defineString } = require("firebase-functions/params");
const { encrypt, decrypt } = require("./crypto");

// These are set via: firebase functions:secrets:set QB_CLIENT_ID, etc.
const QB_CLIENT_ID = defineString("QB_CLIENT_ID");
const QB_CLIENT_SECRET = defineString("QB_CLIENT_SECRET");
const QB_REDIRECT_URI = defineString("QB_REDIRECT_URI");
const QB_ENVIRONMENT = defineString("QB_ENVIRONMENT"); // "sandbox" or "production"

function createOAuthClient() {
  return new OAuthClient({
    clientId: QB_CLIENT_ID.value(),
    clientSecret: QB_CLIENT_SECRET.value(),
    environment: QB_ENVIRONMENT.value(),
    redirectUri: QB_REDIRECT_URI.value(),
  });
}

/**
 * Step 1: Generate the QuickBooks authorization URL and redirect the admin.
 * The admin clicks "Connect to QuickBooks" in the settings page,
 * which calls this function. It redirects them to Intuit's login page.
 */
async function authUri(req, res) {
  const oauthClient = createOAuthClient();

  const authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: "champs-qb-auth", // CSRF protection token
  });

  res.redirect(authUri);
}

/**
 * Step 2: Handle the callback from QuickBooks after admin approves.
 * QuickBooks redirects here with an authorization code.
 * We exchange it for access + refresh tokens and store them encrypted.
 */
async function callback(req, res) {
  const oauthClient = createOAuthClient();

  try {
    const authResponse = await oauthClient.createToken(req.url);
    const tokens = authResponse.getJson();

    // Store tokens encrypted in Firestore
    const db = getFirestore();
    await db.collection("qbTokens").doc("current").set({
      accessToken: encrypt(tokens.access_token),
      refreshToken: encrypt(tokens.refresh_token),
      realmId: tokens.realmId, // QuickBooks company ID — not sensitive, needed for API calls
      tokenType: tokens.token_type,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      refreshExpiresAt: Date.now() + tokens.x_refresh_token_expires_in * 1000,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Write public connection status (no tokens!) so admin UI can show status
    await db.collection("kioskConfig").doc("qbConnection").set({
      connected: true,
      realmId: tokens.realmId,
      connectedAt: Date.now(),
    });

    // Redirect back to admin settings with success indicator
    res.redirect("/admin?qb=connected");
  } catch (err) {
    console.error("QuickBooks OAuth callback error:", err);
    res.redirect("/admin?qb=error");
  }
}

/**
 * Disconnect: revoke tokens and remove from Firestore.
 * Called when admin clicks "Disconnect QuickBooks" in settings.
 */
async function disconnect(req, res) {
  const oauthClient = createOAuthClient();
  const db = getFirestore();

  try {
    const doc = await db.collection("qbTokens").doc("current").get();
    if (!doc.exists) {
      res.status(400).json({ error: "No QuickBooks connection found" });
      return;
    }

    const plainToken = decrypt(doc.data().accessToken);
    oauthClient.setToken({ access_token: plainToken });
    await oauthClient.revoke({ access_token: plainToken });

    await db.collection("qbTokens").doc("current").delete();
    await db.collection("kioskConfig").doc("qbConnection").set({
      connected: false,
      disconnectedAt: Date.now(),
    });
    res.json({ success: true });
  } catch (err) {
    console.error("QuickBooks disconnect error:", err);
    res.status(500).json({ error: "Failed to disconnect" });
  }
}

module.exports = { authUri, callback, disconnect, createOAuthClient };
