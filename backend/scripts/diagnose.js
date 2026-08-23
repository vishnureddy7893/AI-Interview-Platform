#!/usr/bin/env node
/**
 * Environment diagnostic.
 *
 *   cd backend && npm run diagnose
 *
 * Checks every external dependency the server needs and reports the ACTUAL
 * failure for each one. Nothing here writes to the database or sends email.
 * Secrets are never printed — only whether they are set and how long they are.
 */

require("dotenv").config();

const dns = require("dns").promises;
const mongoose = require("mongoose");
const {
  describeTlsTrust,
  isTlsTrustError,
  tlsRemediationHelp,
  getTlsOptions,
} = require("../config/tls");

const PASS = "PASS";
const FAIL = "FAIL";
const WARN = "WARN";

const results = [];

function record(name, status, detail, help) {
  results.push({ name, status, detail, help });
  const icon = status === PASS ? "✔" : status === WARN ? "!" : "✖";
  console.log(`${icon} ${name.padEnd(28)} ${status}  ${detail || ""}`);
  if (help) {
    console.log(
      help
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n")
    );
  }
}

function mask(value) {
  if (!value) return "not set";
  return `set (${String(value).length} chars)`;
}

// ---------------------------------------------------------------- environment

function checkEnv() {
  console.log("\n── Environment ──────────────────────────────────────────────");

  const required = {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  for (const [key, value] of Object.entries(required)) {
    record(key, value ? PASS : FAIL, mask(value));
  }

  const optional = {
    MONGODB_URI: process.env.MONGODB_URI,
    GROQ_MODEL: process.env.GROQ_MODEL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
  };

  record(
    "MONGODB_URI",
    optional.MONGODB_URI ? PASS : WARN,
    optional.MONGODB_URI
      ? "set"
      : "not set — falling back to mongodb://127.0.0.1:27017/AIHiringPlatform"
  );
  record(
    "GROQ_MODEL",
    PASS,
    optional.GROQ_MODEL || "not set — using default openai/gpt-oss-120b"
  );
  record("FRONTEND_URL", optional.FRONTEND_URL ? PASS : WARN, optional.FRONTEND_URL || "not set — CORS allows all origins");
  record("EMAIL_HOST", optional.EMAIL_HOST ? PASS : WARN, optional.EMAIL_HOST || "not set");
  record("EMAIL_USER", optional.EMAIL_USER ? PASS : WARN, optional.EMAIL_USER ? "set" : "not set");
  record("EMAIL_PASS", optional.EMAIL_PASS ? PASS : WARN, mask(optional.EMAIL_PASS));
}

// ------------------------------------------------------------------ TLS trust

function checkTlsConfig() {
  console.log("\n── TLS trust ────────────────────────────────────────────────");
  const trust = describeTlsTrust();

  record("Node version", PASS, trust.nodeVersion);
  record(
    "--use-system-ca",
    trust.usingSystemCa ? PASS : WARN,
    trust.usingSystemCa ? "enabled" : "not enabled"
  );
  record(
    "NODE_EXTRA_CA_CERTS",
    trust.nodeExtraCaCerts ? PASS : WARN,
    trust.nodeExtraCaCerts || "not set"
  );
  record(
    "EXTRA_CA_CERT_PATH",
    trust.extraCaCertLoaded ? PASS : WARN,
    trust.extraCaCertLoaded ? "loaded" : "not set"
  );
  if (trust.smtpAllowSelfSigned) {
    record(
      "SMTP_ALLOW_SELF_SIGNED",
      WARN,
      "true — SMTP certificate verification is DISABLED (dev only)"
    );
  }
}

// --------------------------------------------------------------------- Groq

async function checkGroq() {
  console.log("\n── Groq AI ──────────────────────────────────────────────────");

  try {
    const addresses = await dns.lookup("api.groq.com");
    record("DNS api.groq.com", PASS, addresses.address);
  } catch (error) {
    record(
      "DNS api.groq.com",
      FAIL,
      error.message,
      "No DNS resolution. Check the internet connection or DNS settings."
    );
    return;
  }

  if (!process.env.GROQ_API_KEY) {
    record("Groq API call", FAIL, "skipped — GROQ_API_KEY is not set");
    return;
  }

  const askGroq = require("../groq");
  const model = require("../groq").GROQ_MODEL;

  try {
    const started = Date.now();
    const reply = await askGroq('Reply with exactly: {"ok":true}');
    const ms = Date.now() - started;
    record(
      "Groq API call",
      PASS,
      `model "${model}" responded in ${ms}ms (${String(reply).trim().slice(0, 40)})`
    );
  } catch (error) {
    record(
      "Groq API call",
      FAIL,
      `${error.code || "ERROR"} — ${error.message}`,
      error.help
    );
  }
}

// ------------------------------------------------------------------- MongoDB

async function checkMongo() {
  console.log("\n── MongoDB ──────────────────────────────────────────────────");

  const uri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/AIHiringPlatform";

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    record("MongoDB connection", PASS, mongoose.connection.host);
    await mongoose.disconnect();
  } catch (error) {
    record(
      "MongoDB connection",
      FAIL,
      error.message,
      "Is mongod running? Start it, or set MONGODB_URI to an Atlas connection string."
    );
  }
}

// ---------------------------------------------------------------------- SMTP

async function checkSmtp() {
  console.log("\n── SMTP ─────────────────────────────────────────────────────");

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    record("SMTP connection", WARN, "skipped — SMTP env vars are incomplete");
    return;
  }

  const nodemailer = require("nodemailer");
  const port = Number(process.env.EMAIL_PORT) || 587;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: getTlsOptions(),
  });

  try {
    await transporter.verify();
    record("SMTP connection", PASS, `${process.env.EMAIL_HOST}:${port}`);
  } catch (error) {
    if (isTlsTrustError(error)) {
      record(
        "SMTP connection",
        FAIL,
        "certificate not trusted by Node",
        tlsRemediationHelp(`SMTP host ${process.env.EMAIL_HOST}`)
      );
    } else if (error.code === "EAUTH") {
      record(
        "SMTP connection",
        FAIL,
        "authentication rejected",
        "For Gmail, EMAIL_PASS must be a 16-character App Password (2FA required),\n" +
          "not your normal account password."
      );
    } else {
      record("SMTP connection", FAIL, `${error.code || "ERROR"} — ${error.message}`);
    }
  } finally {
    transporter.close();
  }
}

// --------------------------------------------------------------------- runner

async function main() {
  console.log("AI Interview Platform — environment diagnostic");
  console.log("=============================================");

  checkEnv();
  checkTlsConfig();
  await checkGroq();
  await checkMongo();
  await checkSmtp();

  const failed = results.filter((r) => r.status === FAIL);
  const warned = results.filter((r) => r.status === WARN);

  console.log("\n── Summary ──────────────────────────────────────────────────");
  console.log(
    `${results.length - failed.length - warned.length} passed, ` +
      `${warned.length} warnings, ${failed.length} failed`
  );

  if (failed.length) {
    console.log("\nFailed checks:");
    failed.forEach((r) => console.log(`  • ${r.name}: ${r.detail}`));
  }

  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error("Diagnostic crashed:", error);
  process.exit(1);
});
