/**
 * Judge0 CE integration — submit + poll for code execution.
 *
 * Env:
 *   JUDGE0_API_URL   — e.g. https://judge0-ce.p.rapidapi.com or http://localhost:2358
 *   JUDGE0_API_KEY   — RapidAPI key (optional for self-hosted)
 *   JUDGE0_RAPIDAPI_HOST — default judge0-ce.p.rapidapi.com when using RapidAPI
 *   JUDGE0_POLL_INTERVAL_MS — default 1000
 *   JUDGE0_MAX_POLLS — default 30
 */

const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // OpenJDK
  cpp: 54, // GCC C++
  c: 50, // GCC C
};

const STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_SIGSEGV: 7,
  RUNTIME_SIGXFSZ: 8,
  RUNTIME_SIGFPE: 9,
  RUNTIME_SIGABRT: 10,
  RUNTIME_NZEC: 11,
  RUNTIME_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
};

function logJudge0(level, message, extra) {
  const prefix = "[judge0]";
  if (extra !== undefined) {
    console[level](prefix, message, extra);
  } else {
    console[level](prefix, message);
  }
}

function normalizeLanguageKey(language) {
  const raw = String(language || "")
    .trim()
    .toLowerCase();
  if (!raw) return null;
  if (raw === "js" || raw.includes("javascript") || raw === "node") {
    return "javascript";
  }
  if (raw.includes("python") || raw === "py") return "python";
  if (raw.includes("java") && !raw.includes("script")) return "java";
  if (
    raw.includes("c++") ||
    raw === "cpp" ||
    raw === "cplusplus" ||
    raw.includes("cpp")
  ) {
    return "cpp";
  }
  if (raw === "c") return "c";
  return LANGUAGE_IDS[raw] != null ? raw : null;
}

function mapLanguageToJudge0Id(language) {
  const key = normalizeLanguageKey(language);
  if (!key || LANGUAGE_IDS[key] == null) {
    const error = new Error(
      "Unsupported language. Use Java, Python, C++, JavaScript, or C."
    );
    error.code = "INVALID_LANGUAGE";
    error.statusCode = 400;
    throw error;
  }
  return { key, languageId: LANGUAGE_IDS[key] };
}

function inspectEnv() {
  const urlRaw = process.env.JUDGE0_API_URL;
  const keyRaw = process.env.JUDGE0_API_KEY;
  return {
    JUDGE0_API_URL:
      urlRaw === undefined
        ? "MISSING (undefined)"
        : urlRaw === ""
          ? "MISSING (empty string)"
          : urlRaw,
    JUDGE0_API_KEY:
      keyRaw === undefined
        ? "MISSING (undefined)"
        : keyRaw === ""
          ? "MISSING (empty string)"
          : `SET (length=${keyRaw.length})`,
    JUDGE0_RAPIDAPI_HOST:
      process.env.JUDGE0_RAPIDAPI_HOST ||
      "judge0-ce.p.rapidapi.com (default)",
    JUDGE0_POLL_INTERVAL_MS: process.env.JUDGE0_POLL_INTERVAL_MS || "1000 (default)",
    JUDGE0_MAX_POLLS: process.env.JUDGE0_MAX_POLLS || "30 (default)",
  };
}

function getConfig() {
  const envSnapshot = inspectEnv();
  logJudge0("log", "Environment check", envSnapshot);

  const baseUrl = (process.env.JUDGE0_API_URL || "").replace(/\/$/, "");
  if (!baseUrl) {
    const missing = [];
    if (process.env.JUDGE0_API_URL === undefined) {
      missing.push("JUDGE0_API_URL (not set in process.env)");
    } else if (process.env.JUDGE0_API_URL === "") {
      missing.push("JUDGE0_API_URL (set but empty)");
    } else {
      missing.push("JUDGE0_API_URL");
    }

    logJudge0(
      "error",
      `Missing required environment variable(s): ${missing.join(", ")}. Request never reaches Judge0.`
    );

    const error = new Error(
      `Judge0 is not configured. Missing required environment variable: JUDGE0_API_URL (currently ${
        process.env.JUDGE0_API_URL === undefined
          ? "undefined"
          : "empty string"
      }). Set JUDGE0_API_URL to your Judge0 base URL (e.g. https://judge0-ce.p.rapidapi.com or http://localhost:2358).`
    );
    error.code = "JUDGE0_UNAVAILABLE";
    error.statusCode = 503;
    error.missingEnv = missing;
    throw error;
  }

  const apiKey = process.env.JUDGE0_API_KEY || "";
  const looksLikeRapidApi = /rapidapi\.com/i.test(baseUrl);
  if (looksLikeRapidApi && !apiKey) {
    logJudge0(
      "warn",
      "JUDGE0_API_URL points at RapidAPI but JUDGE0_API_KEY is missing/empty. Judge0 calls will likely return 401/403."
    );
  }

  return {
    baseUrl,
    apiKey,
    rapidApiHost:
      process.env.JUDGE0_RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com",
    pollIntervalMs: Number(process.env.JUDGE0_POLL_INTERVAL_MS) || 1000,
    maxPolls: Number(process.env.JUDGE0_MAX_POLLS) || 30,
  };
}

function buildHeaders(config) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (config.apiKey) {
    headers["X-RapidAPI-Key"] = config.apiKey;
    headers["X-RapidAPI-Host"] = config.rapidApiHost;
  }

  return headers;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function judge0Fetch(path, options = {}, config) {
  const cfg = config || getConfig();
  const url = `${cfg.baseUrl}${path}`;
  const headers = {
    ...buildHeaders(cfg),
    ...(options.headers || {}),
  };

  // Log headers without leaking the full API key
  const safeHeaders = { ...headers };
  if (safeHeaders["X-RapidAPI-Key"]) {
    safeHeaders["X-RapidAPI-Key"] = `${String(
      safeHeaders["X-RapidAPI-Key"]
    ).slice(0, 6)}…(redacted)`;
  }

  logJudge0("log", "Outgoing Judge0 request", {
    method: options.method || "GET",
    url,
    headers: safeHeaders,
    body: options.body || null,
  });

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    logJudge0("error", "Network error — request never completed to Judge0", {
      url,
      name: err?.name,
      message: err?.message,
      cause: err?.cause,
      stack: err?.stack,
    });
    const error = new Error(
      `Judge0 unavailable: ${err.message || "network error"}`
    );
    error.code = "JUDGE0_UNAVAILABLE";
    error.statusCode = 503;
    error.cause = err;
    throw error;
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  logJudge0("log", "Judge0 HTTP response", {
    url,
    httpStatus: response.status,
    ok: response.ok,
    body: data,
    rawBodyPreview: text?.slice?.(0, 2000) || text,
  });

  if (!response.ok) {
    if ([401, 403, 404].includes(response.status)) {
      logJudge0(
        "error",
        `Judge0 returned ${response.status} — full response body:`,
        data
      );
    }

    const error = new Error(
      data?.error ||
        data?.message ||
        `Judge0 request failed (${response.status})`
    );
    error.code =
      response.status === 429 ? "JUDGE0_RATE_LIMITED" : "JUDGE0_UNAVAILABLE";
    error.statusCode = response.status === 429 ? 429 : 503;
    error.details = data;
    error.httpStatus = response.status;
    throw error;
  }

  return data;
}

function classifyStatus(statusId, statusDescription) {
  const id = Number(statusId);
  if (id === STATUS.ACCEPTED) return "Accepted";
  if (id === STATUS.COMPILATION_ERROR) return "Compilation Error";
  if (id === STATUS.TIME_LIMIT_EXCEEDED) return "Time Limit Exceeded";
  if (id >= STATUS.RUNTIME_SIGSEGV && id <= STATUS.RUNTIME_OTHER) {
    return "Runtime Error";
  }
  if (id === STATUS.WRONG_ANSWER) return "Wrong Answer";
  if (id === STATUS.INTERNAL_ERROR || id === STATUS.EXEC_FORMAT_ERROR) {
    return statusDescription || "Internal Error";
  }
  return statusDescription || "Unknown";
}

function formatResult(submission) {
  const statusId = submission?.status?.id;
  const statusDescription = submission?.status?.description || "";
  const status = classifyStatus(statusId, statusDescription);

  const timeSeconds = submission?.time != null ? Number(submission.time) : null;
  const timeMs =
    timeSeconds != null && Number.isFinite(timeSeconds)
      ? Math.round(timeSeconds * 1000)
      : null;

  return {
    status,
    statusId: statusId ?? null,
    statusDescription,
    stdout: submission?.stdout || "",
    stderr: submission?.stderr || "",
    compileOutput: submission?.compile_output || "",
    time: timeMs,
    memory: submission?.memory != null ? Number(submission.memory) : null,
    token: submission?.token || null,
  };
}

async function createSubmission({ languageId, sourceCode, stdin }, config) {
  const payload = {
    language_id: languageId,
    source_code: sourceCode,
    stdin: stdin || "",
  };

  logJudge0("log", "Submission payload", {
    language_id: payload.language_id,
    stdin: payload.stdin,
    sourceCodeLength: String(payload.source_code || "").length,
    sourceCodePreview: String(payload.source_code || "").slice(0, 200),
  });

  return judge0Fetch(
    "/submissions?base64_encoded=false&wait=false",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    config
  );
}

async function getSubmission(token, config) {
  return judge0Fetch(
    `/submissions/${encodeURIComponent(token)}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status,time,memory,token`,
    { method: "GET" },
    config
  );
}

/**
 * Submit source to Judge0 and poll until finished.
 */
async function executeCode({ language, sourceCode, stdin = "" }) {
  logJudge0("log", "executeCode called", {
    language,
    sourceCodeLength: sourceCode ? String(sourceCode).length : 0,
    stdinLength: stdin ? String(stdin).length : 0,
  });

  if (!sourceCode || !String(sourceCode).trim()) {
    const error = new Error("sourceCode is required");
    error.code = "MISSING_SOURCE";
    error.statusCode = 400;
    throw error;
  }

  const mapped = mapLanguageToJudge0Id(language);
  logJudge0("log", "Selected language mapping", {
    incomingLanguage: language,
    normalizedKey: mapped.key,
    judge0LanguageId: mapped.languageId,
  });

  const config = getConfig();
  logJudge0("log", "Using Judge0 API URL", { baseUrl: config.baseUrl });

  const created = await createSubmission(
    {
      languageId: mapped.languageId,
      sourceCode: String(sourceCode),
      stdin: stdin == null ? "" : String(stdin),
    },
    config
  );

  logJudge0("log", "Create submission response", created);

  const token = created?.token;
  if (!token) {
    logJudge0(
      "error",
      "Judge0 create response had no token — full body:",
      created
    );
    const error = new Error("Judge0 did not return a submission token");
    error.code = "JUDGE0_UNAVAILABLE";
    error.statusCode = 503;
    error.details = created;
    throw error;
  }

  let submission = created;
  for (let i = 0; i < config.maxPolls; i += 1) {
    submission = await getSubmission(token, config);
    logJudge0("log", `Polling response #${i + 1}`, {
      token,
      statusId: submission?.status?.id,
      statusDescription: submission?.status?.description,
      body: submission,
    });

    const id = Number(submission?.status?.id);
    if (id !== STATUS.IN_QUEUE && id !== STATUS.PROCESSING) {
      const result = formatResult(submission);
      logJudge0("log", "Execution finished", result);
      return result;
    }
    await sleep(config.pollIntervalMs);
  }

  const error = new Error("Judge0 execution timed out while waiting for result");
  error.code = "JUDGE0_TIMEOUT";
  error.statusCode = 504;
  throw error;
}

module.exports = {
  LANGUAGE_IDS,
  mapLanguageToJudge0Id,
  executeCode,
  formatResult,
  inspectEnv,
};
