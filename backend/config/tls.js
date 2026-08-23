const fs = require("fs");
const path = require("path");

/**
 * Central TLS trust configuration.
 *
 * Why this exists:
 * Node.js ships its own bundled CA store and does NOT read the operating system
 * trust store by default. On machines behind a TLS-inspecting proxy (corporate
 * network, campus network, or antivirus with "HTTPS scanning" enabled) every
 * outbound HTTPS/SMTP connection is re-signed by a locally installed root CA.
 * Browsers trust it because it lives in the OS store; Node does not, and fails
 * with SELF_SIGNED_CERT_IN_CHAIN / UNABLE_TO_VERIFY_LEAF_SIGNATURE.
 *
 * That single cause breaks BOTH SMTP (nodemailer) and the Groq API client.
 *
 * Security posture:
 * - Certificate verification is ALWAYS on by default.
 * - The supported fix is to make Node trust the extra root CA, not to skip
 *   verification: run with `--use-system-ca`, set NODE_EXTRA_CA_CERTS, or point
 *   EXTRA_CA_CERT_PATH at the PEM file.
 * - SMTP_ALLOW_SELF_SIGNED remains a last-resort, dev-only escape hatch and is
 *   loudly warned about at startup.
 */

const TLS_TRUST_ERROR_CODES = new Set([
  "SELF_SIGNED_CERT_IN_CHAIN",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "CERT_SIGNATURE_FAILURE",
  "ERR_TLS_CERT_ALTNAME_INVALID",
]);

const TLS_TRUST_MESSAGE_PATTERN =
  /self[- ]signed certificate|unable to verify the first certificate|unable to get local issuer certificate|certificate signature failure/i;

let cachedCa;

function readExtraCaCert() {
  if (cachedCa !== undefined) return cachedCa;

  const configured = process.env.EXTRA_CA_CERT_PATH;
  if (!configured || !configured.trim()) {
    cachedCa = null;
    return cachedCa;
  }

  const resolved = path.isAbsolute(configured)
    ? configured
    : path.resolve(__dirname, "..", configured);

  try {
    const pem = fs.readFileSync(resolved, "utf8");
    if (!pem.includes("BEGIN CERTIFICATE")) {
      console.error(
        `[tls] EXTRA_CA_CERT_PATH does not look like a PEM certificate: ${resolved}`
      );
      cachedCa = null;
      return cachedCa;
    }
    cachedCa = pem;
    return cachedCa;
  } catch (error) {
    console.error(
      `[tls] Could not read EXTRA_CA_CERT_PATH (${resolved}): ${error.message}`
    );
    cachedCa = null;
    return cachedCa;
  }
}

/** True when the error is a certificate-trust failure rather than a real outage. */
function isTlsTrustError(error) {
  if (!error) return false;

  const candidates = [error, error.cause, error.cause?.cause].filter(Boolean);

  return candidates.some((candidate) => {
    const code = candidate.code || candidate.errno;
    if (code && TLS_TRUST_ERROR_CODES.has(String(code))) return true;
    const message = candidate.message || "";
    return TLS_TRUST_MESSAGE_PATTERN.test(message);
  });
}

/** tls options for nodemailer / node https clients. */
function getTlsOptions() {
  const options = {};
  const ca = readExtraCaCert();

  if (ca) {
    // Adds the extra root to the trust chain. Verification stays enabled.
    options.ca = ca;
  }

  if (process.env.SMTP_ALLOW_SELF_SIGNED === "true") {
    options.rejectUnauthorized = false;
  }

  return options;
}

function describeTlsTrust() {
  return {
    usingSystemCa: process.execArgv.includes("--use-system-ca"),
    nodeExtraCaCerts: process.env.NODE_EXTRA_CA_CERTS || null,
    extraCaCertLoaded: Boolean(readExtraCaCert()),
    smtpAllowSelfSigned: process.env.SMTP_ALLOW_SELF_SIGNED === "true",
    nodeVersion: process.version,
  };
}

/**
 * Actionable remediation text printed when a trust failure is detected.
 * Kept in one place so SMTP, Groq, and the diagnose script say the same thing.
 */
function tlsRemediationHelp(target = "the remote server") {
  return [
    `TLS certificate verification failed while connecting to ${target}.`,
    "",
    "This is almost always a TLS-inspecting proxy or antivirus HTTPS scanning on",
    "this machine. Your browser trusts it (OS trust store); Node.js does not.",
    "",
    "Fix it by making Node trust that root CA — pick ONE:",
    "  1. Run the server with the OS trust store (Node 22.15+ / 23.5+):",
    "       npm run start:system-ca      (or: npm run dev:system-ca)",
    "  2. Export the intercepting root certificate to a .pem file and set:",
    "       NODE_EXTRA_CA_CERTS=C:\\path\\to\\corporate-root.pem",
    "     or, app-level, in backend/.env:",
    "       EXTRA_CA_CERT_PATH=./certs/corporate-root.pem",
    "  3. Disable HTTPS/SSL scanning in your antivirus for this machine.",
    "",
    "Run `npm run diagnose` in backend/ for a full check.",
    "Do NOT disable certificate verification to work around this in production.",
  ].join("\n");
}

function warnOnInsecureConfig() {
  if (process.env.SMTP_ALLOW_SELF_SIGNED === "true") {
    console.warn(
      "[tls] ⚠ SMTP_ALLOW_SELF_SIGNED=true — SMTP certificate verification is DISABLED. " +
        "Development only. Never enable this in production."
    );
  }
}

module.exports = {
  getTlsOptions,
  isTlsTrustError,
  describeTlsTrust,
  tlsRemediationHelp,
  warnOnInsecureConfig,
};
