/**
 * Regression tests for the background resume analysis queue.
 *
 *   cd backend && npm test
 *
 * Runs with no database and no AI provider: the Candidate model, the parse
 * service and the resume storage helper are replaced in the require cache, so
 * the test exercises the queue's real scheduling, claiming and retry logic
 * without any external dependency.
 *
 * What it protects:
 *  - a job is never analysed twice, however many requests arrive at once
 *  - terminal errors (corrupt PDF) do not burn AI quota on pointless retries
 *  - transient errors (rate limit, timeout) do retry, with a bounded count
 */

const path = require("path");
const assert = require("assert");

const BACKEND = path.join(__dirname, "..");

// Fast timings so the suite finishes in a couple of seconds.
process.env.RESUME_ANALYSIS_RETRY_DELAY_MS =
  process.env.RESUME_ANALYSIS_RETRY_DELAY_MS || "200";
process.env.RESUME_ANALYSIS_MAX_ATTEMPTS =
  process.env.RESUME_ANALYSIS_MAX_ATTEMPTS || "3";

// ---------------------------------------------------------------- test doubles

const candidatePath = path.join(BACKEND, "models", "Candidate.js");
const parseServicePath = path.join(BACKEND, "services", "resumeParseService.js");
const storagePath = path.join(BACKEND, "utils", "resumeStorage.js");

const db = new Map();

function applyUpdate(doc, update) {
  const write = (key, value) => {
    const parts = key.split(".");
    let node = doc;
    for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]] ??= {};
    return { node, leaf: parts.at(-1), value };
  };

  for (const [key, value] of Object.entries(update.$set || {})) {
    const { node, leaf } = write(key, value);
    node[leaf] = value;
  }
  for (const [key, value] of Object.entries(update.$inc || {})) {
    const { node, leaf } = write(key, value);
    node[leaf] = (node[leaf] || 0) + value;
  }
}

function matchesClaim(doc, filter) {
  if (!filter.$or) return true;
  const status = doc.resumeAnalysis?.status;

  return filter.$or.some((clause) => {
    const wanted = clause["resumeAnalysis.status"];
    if (wanted?.$in) return wanted.$in.includes(status);
    if (wanted !== status) return false;
    const startedBefore = clause["resumeAnalysis.startedAt"]?.$lt;
    if (startedBefore) return doc.resumeAnalysis?.startedAt < startedBefore;
    return true;
  });
}

const Candidate = {
  async findByIdAndUpdate(id, update) {
    const doc = db.get(String(id));
    if (doc) applyUpdate(doc, update);
    return doc || null;
  },
  async findOneAndUpdate(filter, update) {
    const doc = db.get(String(filter._id));
    if (!doc || !matchesClaim(doc, filter)) return null;
    applyUpdate(doc, update);
    return doc;
  },
  async updateOne(filter, update) {
    const doc = db.get(String(filter._id));
    if (doc) applyUpdate(doc, update);
    return { acknowledged: true };
  },
  find() {
    return { limit: async () => [] };
  },
};

let parseCalls = 0;
let parseBehaviour = async () => {};

const stub = (filename, exports) => {
  require.cache[filename] = { id: filename, filename, loaded: true, exports };
};

stub(candidatePath, Candidate);
stub(storagePath, { getResumeFilename: (c) => c.resume?.filename || null });
stub(parseServicePath, {
  parseCandidateResume: async (candidate) => {
    parseCalls += 1;
    return parseBehaviour(candidate);
  },
});

const queue = require(path.join(BACKEND, "services", "resumeAnalysisQueue.js"));

// ---------------------------------------------------------------- test harness

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log(`  ✔ ${name}`);
  } else {
    failed += 1;
    console.log(`  ✖ ${name}`);
  }
}

function seedCandidate(id) {
  const doc = {
    _id: id,
    resume: { filename: "cv.pdf" },
    resumeAnalysis: { status: "idle", attempts: 0 },
  };
  db.set(id, doc);
  return doc;
}

const aiError = (code, message) =>
  Object.assign(new Error(message), { code });

// ---------------------------------------------------------------------- tests

async function run() {
  console.log("resumeAnalysisQueue\n");

  console.log("upload starts analysis in the background");
  parseCalls = 0;
  parseBehaviour = async () => {};
  const happy = seedCandidate("happy");
  await queue.queueAnalysis("happy");
  await sleep(150);
  check("reaches completed", happy.resumeAnalysis.status === "completed");
  check("analysed exactly once", parseCalls === 1);
  check("records completedAt", Boolean(happy.resumeAnalysis.completedAt));

  console.log("\nconcurrent requests never duplicate a job");
  parseCalls = 0;
  parseBehaviour = async () => sleep(60);
  seedCandidate("dupe");
  await Promise.all(
    Array.from({ length: 5 }, () => queue.queueAnalysis("dupe"))
  );
  await sleep(300);
  check("five requests produced one analysis", parseCalls === 1);

  console.log("\nterminal failures are not retried");
  parseCalls = 0;
  parseBehaviour = async () => {
    throw aiError("CORRUPT_PDF", "Failed to read PDF");
  };
  const terminal = seedCandidate("terminal");
  await queue.queueAnalysis("terminal");
  await sleep(250);
  check("marked failed", terminal.resumeAnalysis.status === "failed");
  check("did not retry", parseCalls === 1);
  check(
    "stored the cause",
    terminal.resumeAnalysis.lastError?.code === "CORRUPT_PDF"
  );
  check(
    "flagged as non-retryable",
    terminal.resumeAnalysis.lastError?.retryable === false
  );

  console.log("\ntransient failures retry and recover");
  parseCalls = 0;
  parseBehaviour = async () => {
    if (parseCalls < 2) throw aiError("AI_RATE_LIMIT", "rate limited");
  };
  const transient = seedCandidate("transient");
  await queue.queueAnalysis("transient");
  await sleep(1500);
  check("eventually completed", transient.resumeAnalysis.status === "completed");
  check("took more than one attempt", parseCalls >= 2);

  console.log("\nretries are bounded");
  parseCalls = 0;
  parseBehaviour = async () => {
    throw aiError("AI_TIMEOUT", "timed out");
  };
  const capped = seedCandidate("capped");
  await queue.queueAnalysis("capped");
  await sleep(3000);
  check("gives up", capped.resumeAnalysis.status === "failed");
  check(
    `stops at ${queue.MAX_ATTEMPTS} attempts (got ${capped.resumeAnalysis.attempts})`,
    capped.resumeAnalysis.attempts === queue.MAX_ATTEMPTS
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  assert.strictEqual(failed, 0, `${failed} test(s) failed`);
}

run().then(
  () => process.exit(0),
  (error) => {
    console.error(error.message);
    process.exit(1);
  }
);
