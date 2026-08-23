const nodemailer = require("nodemailer");
const {
  getTlsOptions,
  isTlsTrustError,
  tlsRemediationHelp,
  warnOnInsecureConfig,
} = require("./tls");

/**
 * SMTP transport.
 *
 * Certificate verification stays ENABLED by default. When the machine sits
 * behind a TLS-inspecting proxy or antivirus, the correct fix is to make Node
 * trust that root CA (see config/tls.js) — not to turn verification off.
 */

warnOnInsecureConfig();

const REQUIRED_ENV = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

const port = Number(process.env.EMAIL_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  // 465 is implicit TLS; 587/25 negotiate STARTTLS.
  secure: port === 465,
  requireTLS: port !== 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: getTlsOptions(),
});

/**
 * Verify lazily and non-fatally.
 *
 * A failed verification must never take the API down — email is a side channel,
 * not a prerequisite for logging in or running an interview. We log a precise,
 * actionable diagnosis instead of a raw stack trace.
 */
function verifyTransport() {
  if (missingEnv.length) {
    console.warn(
      `[mail] SMTP not configured — missing ${missingEnv.join(", ")}. ` +
        "Outgoing email is disabled until these are set in backend/.env."
    );
    return Promise.resolve(false);
  }

  return transporter
    .verify()
    .then(() => {
      console.log(`[mail] SMTP connected (${process.env.EMAIL_USER})`);
      return true;
    })
    .catch((error) => {
      if (isTlsTrustError(error)) {
        console.error(`[mail] SMTP connection failed — certificate not trusted`);
        console.error(tlsRemediationHelp(`SMTP host ${process.env.EMAIL_HOST}`));
      } else if (error.code === "EAUTH") {
        console.error(
          "[mail] SMTP authentication failed. For Gmail, EMAIL_PASS must be a " +
            "16-character App Password (not the account password) with 2FA enabled."
        );
      } else {
        console.error(
          `[mail] SMTP connection failed (${error.code || "unknown"}): ${error.message}`
        );
      }
      console.warn("[mail] Server will continue running; email sending is degraded.");
      return false;
    });
}

// Fire and forget at startup — never blocks or crashes boot.
verifyTransport();

module.exports = transporter;
module.exports.verifyTransport = verifyTransport;
module.exports.isEmailConfigured = () => missingEnv.length === 0;
