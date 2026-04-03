const bcrypt = require("bcrypt");
const { getFirestore } = require("firebase-admin/firestore");

const BCRYPT_ROUNDS = 12;

// Old FNV-1a hash for migration detection
function legacyHash(raw) {
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0") + "_champs_bk";
}

function isLegacyHash(hash) {
  return hash && hash.endsWith("_champs_bk") && hash.length === 19;
}

/**
 * Verify a kiosk user's password server-side.
 * Handles both legacy FNV-1a hashes and new bcrypt hashes.
 * If a legacy hash matches, auto-migrates to bcrypt.
 *
 * POST body: { email, password }
 * Returns: { success, user } or { success: false, error }
 */
async function verifyPassword(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: "Email and password required" });
    return;
  }

  const db = getFirestore();
  const snap = await db.collection("kioskUsers")
    .where("email", "==", email.toLowerCase().trim())
    .limit(1)
    .get();

  if (snap.empty) {
    res.status(401).json({ success: false, error: "Invalid credentials" });
    return;
  }

  const userDoc = snap.docs[0];
  const userData = userDoc.data();
  const storedHash = userData.passwordHash;

  let valid = false;

  if (isLegacyHash(storedHash)) {
    // Compare against old FNV-1a hash
    valid = legacyHash(password) === storedHash;

    if (valid) {
      // Auto-migrate to bcrypt on successful login
      const bcryptHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await userDoc.ref.update({ passwordHash: bcryptHash });
      console.log(`Migrated user ${email} from FNV-1a to bcrypt`);
    }
  } else {
    // Compare against bcrypt hash
    valid = await bcrypt.compare(password, storedHash);
  }

  if (!valid) {
    res.status(401).json({ success: false, error: "Invalid credentials" });
    return;
  }

  // Return user data (without passwordHash)
  const { passwordHash, ...safeUser } = userData;
  res.json({ success: true, user: { id: userDoc.id, ...safeUser } });
}

/**
 * Hash a password with bcrypt for new user registration.
 *
 * POST body: { password }
 * Returns: { hash }
 */
async function hashPassword(req, res) {
  const { password } = req.body;

  if (!password || password.length < 4) {
    res.status(400).json({ error: "Password must be at least 4 characters" });
    return;
  }

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  res.json({ hash });
}

module.exports = { verifyPassword, hashPassword };
