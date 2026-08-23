const Groq = require("groq-sdk");
const { isTlsTrustError, tlsRemediationHelp } = require("./config/tls");

const DEFAULT_MODEL = "openai/gpt-oss-120b";
const DEFAULT_TIMEOUT_MS = Number(process.env.GROQ_TIMEOUT_MS) || 60000;
const DEFAULT_MAX_RETRIES = Number(process.env.GROQ_MAX_RETRIES) || 2;

const MODEL = process.env.GROQ_MODEL || DEFAULT_MODEL;

let client;

function getClient() {
  if (client) return client;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    const error = new Error("GROQ_API_KEY is not set in backend/.env");
    error.code = "AI_NOT_CONFIGURED";
    error.statusCode = 503;
    throw error;
  }

  client = new Groq({
    apiKey,
    timeout: DEFAULT_TIMEOUT_MS,
    maxRetries: DEFAULT_MAX_RETRIES,
  });

  return client;
}

/**
 * Classify a Groq SDK / network failure into a stable application error.
 *
 * The previous implementation collapsed every failure into a single
 * "AI service unavailable" message, which made a missing API key, an expired
 * key, a decommissioned model and a corporate TLS proxy indistinguishable both
 * to the user and in the logs. Each cause now gets its own code so the UI can
 * say something useful and the logs point at the real problem.
 */
function classifyGroqError(error) {
  const status = error?.status ?? error?.statusCode;
  const message = error?.message || String(error);
  const apiCode = error?.error?.error?.code || error?.error?.code;

  // TLS interception (corporate proxy / antivirus HTTPS scanning).
  if (isTlsTrustError(error)) {
    const err = new Error(
      "Cannot reach the AI service: the HTTPS certificate could not be verified"
    );
    err.code = "AI_TLS_UNTRUSTED";
    err.statusCode = 502;
    err.cause = error;
    err.help = tlsRemediationHelp("api.groq.com");
    return err;
  }

  // Missing / invalid / revoked credentials — a configuration problem, not an outage.
  if (status === 401 || status === 403 || /invalid api key|unauthorized/i.test(message)) {
    const err = new Error("AI service rejected the API key");
    err.code = "AI_AUTH_FAILED";
    err.statusCode = 503;
    err.cause = error;
    err.help =
      "GROQ_API_KEY in backend/.env is missing, expired, or revoked. " +
      "Create a new key at https://console.groq.com/keys and restart the server.";
    return err;
  }

  // Model no longer served / renamed.
  if (
    status === 404 ||
    apiCode === "model_not_found" ||
    apiCode === "model_decommissioned" ||
    /decommissioned|does not exist|model_not_found/i.test(message)
  ) {
    const err = new Error(`AI model "${MODEL}" is not available`);
    err.code = "AI_MODEL_UNAVAILABLE";
    err.statusCode = 503;
    err.cause = error;
    err.help =
      `Groq no longer serves "${MODEL}". Set GROQ_MODEL in backend/.env to a ` +
      "currently supported model (see https://console.groq.com/docs/models).";
    return err;
  }

  if (status === 429 || /rate limit/i.test(message)) {
    const err = new Error("AI service is rate limited");
    err.code = "AI_RATE_LIMIT";
    err.statusCode = 429;
    err.cause = error;
    return err;
  }

  if (
    status === 408 ||
    error?.name === "APIConnectionTimeoutError" ||
    /timeout|timed out|ETIMEDOUT|ESOCKETTIMEDOUT|AbortError/i.test(message)
  ) {
    const err = new Error("AI service timed out");
    err.code = "AI_TIMEOUT";
    err.statusCode = 504;
    err.cause = error;
    return err;
  }

  // DNS / offline / blocked egress.
  const networkCode = error?.cause?.code || error?.code;
  if (
    ["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ECONNRESET", "EHOSTUNREACH", "ENETUNREACH"].includes(
      String(networkCode)
    ) ||
    error?.name === "APIConnectionError"
  ) {
    const err = new Error("Cannot reach the AI service");
    err.code = "AI_NETWORK_ERROR";
    err.statusCode = 502;
    err.cause = error;
    err.help =
      "api.groq.com is unreachable from this machine. Check the internet " +
      "connection, VPN, firewall, or proxy settings.";
    return err;
  }

  if (status >= 500) {
    const err = new Error("AI service is temporarily unavailable");
    err.code = "AI_UPSTREAM_ERROR";
    err.statusCode = 502;
    err.cause = error;
    return err;
  }

  const err = new Error(message || "AI request failed");
  err.code = "AI_FAILURE";
  err.statusCode = 502;
  err.cause = error;
  return err;
}

/**
 * Send a single-turn prompt to Groq.
 * Throws a classified error (see classifyGroqError) on any failure.
 */
async function askGroq(prompt, options = {}) {
  let groq;
  try {
    groq = getClient();
  } catch (error) {
    throw error; // AI_NOT_CONFIGURED — already classified
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: options.model || MODEL,
      temperature: options.temperature ?? 0.2,
      ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
    });

    return completion.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    throw classifyGroqError(error);
  }
}

module.exports = askGroq;
module.exports.askGroq = askGroq;
module.exports.classifyGroqError = classifyGroqError;
module.exports.GROQ_MODEL = MODEL;
