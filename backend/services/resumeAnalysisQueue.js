const Candidate = require("../models/Candidate");
const { parseCandidateResume } = require("./resumeParseService");
const { getResumeFilename } = require("../utils/resumeStorage");

/**
 * Background resume analysis.
 *
 * Design notes
 * ------------
 * The project has no job runner, no Redis and no worker process, and adding one
 * for a single job type would be unjustified infrastructure. This is the
 * simplest architecture that is still correct:
 *
 *  - MongoDB is the queue. `resumeAnalysis.status` is the job state and the
 *    claim is an atomic findOneAndUpdate, so two concurrent requests (or two
 *    server instances) can never analyse the same resume twice.
 *  - Work runs in-process on a bounded worker pool, so an upload spike cannot
 *    open unlimited concurrent AI calls.
 *  - Failures retry with exponential backoff, but only for causes that can
 *    plausibly succeed later (timeout, rate limit, transient network). A
 *    corrupt PDF or a missing API key is terminal — retrying wastes quota and
 *    keeps the candidate waiting for something that will never work.
 *  - On boot, jobs left in `processing` by a crash are reclaimed, and jobs due
 *    for retry are re-queued. Nothing is lost across a restart.
 *
 * If this ever needs to survive multi-instance deploys with real durability, the
 * claim query below is already the right shape for a real queue — only the
 * scheduler needs replacing.
 */

const MAX_ATTEMPTS = Number(process.env.RESUME_ANALYSIS_MAX_ATTEMPTS) || 3;
const BASE_RETRY_DELAY_MS =
  Number(process.env.RESUME_ANALYSIS_RETRY_DELAY_MS) || 15000;
const MAX_CONCURRENCY = Number(process.env.RESUME_ANALYSIS_CONCURRENCY) || 2;
// A job claimed longer ago than this was orphaned by a crash.
const STALE_CLAIM_MS = 5 * 60 * 1000;

/** Causes that may succeed on a later attempt. Everything else is terminal. */
const RETRYABLE_CODES = new Set([
  "AI_RATE_LIMIT",
  "AI_TIMEOUT",
  "AI_NETWORK_ERROR",
  "AI_UPSTREAM_ERROR",
  "AI_FAILURE",
  "INVALID_AI_JSON",
  "SAVE_ANALYSIS_FAILED",
]);

const pending = [];
const inFlight = new Set();
let activeWorkers = 0;

function isRetryable(error) {
  return RETRYABLE_CODES.has(error?.code);
}

function retryDelayMs(attempts) {
  // 15s, 30s, 60s … capped at 5 minutes
  return Math.min(BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attempts - 1), 300000);
}

/**
 * Mark a resume as awaiting analysis and schedule the work.
 * Safe to call repeatedly — an already-queued or running job is not duplicated.
 */
async function queueAnalysis(candidateId, { reason = "upload" } = {}) {
  const id = String(candidateId);

  const candidate = await Candidate.findByIdAndUpdate(
    id,
    {
      $set: {
        "resumeAnalysis.status": "uploaded",
        "resumeAnalysis.queuedAt": new Date(),
        "resumeAnalysis.nextRetryAt": null,
        "resumeAnalysis.lastError": null,
      },
    },
    { new: true }
  );

  if (!candidate) return null;

  console.log(`[resume-analysis] queued candidate=${id} reason=${reason}`);
  schedule(id);

  return candidate.resumeAnalysis;
}

/**
 * Reset the attempt counter and queue again — used by an explicit
 * "Try again" from the candidate after a terminal failure.
 */
async function requeueAnalysis(candidateId) {
  await Candidate.findByIdAndUpdate(candidateId, {
    $set: { "resumeAnalysis.attempts": 0 },
  });
  return queueAnalysis(candidateId, { reason: "manual-retry" });
}

function schedule(candidateId, delayMs = 0) {
  const id = String(candidateId);

  // A delayed schedule must always arm its timer. The de-duplication check
  // belongs at fire time, not now: a retry is scheduled from inside the failing
  // job, while that job still counts as in-flight, so checking here would
  // silently drop every retry.
  if (delayMs > 0) {
    setTimeout(() => schedule(id), delayMs).unref?.();
    return;
  }

  if (inFlight.has(id) || pending.includes(id)) return;

  pending.push(id);
  drain();
}

function drain() {
  while (activeWorkers < MAX_CONCURRENCY && pending.length) {
    const id = pending.shift();
    if (inFlight.has(id)) continue;

    activeWorkers += 1;
    inFlight.add(id);

    runJob(id)
      .catch((error) => {
        console.error(`[resume-analysis] worker crashed candidate=${id}`, error);
      })
      .finally(() => {
        inFlight.delete(id);
        activeWorkers -= 1;
        drain();
      });
  }
}

/**
 * Atomically claim the job. Returns null when another worker already holds it,
 * which is what makes duplicate analysis impossible.
 */
async function claim(candidateId) {
  const staleBefore = new Date(Date.now() - STALE_CLAIM_MS);

  return Candidate.findOneAndUpdate(
    {
      _id: candidateId,
      $or: [
        { "resumeAnalysis.status": { $in: ["uploaded", "failed"] } },
        // Reclaim a job orphaned by a crashed process.
        {
          "resumeAnalysis.status": "processing",
          "resumeAnalysis.startedAt": { $lt: staleBefore },
        },
      ],
    },
    {
      $set: {
        "resumeAnalysis.status": "processing",
        "resumeAnalysis.startedAt": new Date(),
      },
      $inc: { "resumeAnalysis.attempts": 1 },
    },
    { new: true }
  );
}

async function runJob(candidateId) {
  const candidate = await claim(candidateId);

  if (!candidate) {
    // Already running elsewhere, or completed in the meantime. Nothing to do.
    return;
  }

  const filename = getResumeFilename(candidate);

  if (!filename) {
    await Candidate.findByIdAndUpdate(candidateId, {
      $set: {
        "resumeAnalysis.status": "idle",
        "resumeAnalysis.attempts": 0,
      },
    });
    return;
  }

  const attempts = candidate.resumeAnalysis?.attempts || 1;

  try {
    await parseCandidateResume(candidate);

    await Candidate.findByIdAndUpdate(candidateId, {
      $set: {
        "resumeAnalysis.status": "completed",
        "resumeAnalysis.completedAt": new Date(),
        "resumeAnalysis.resumeFilename": filename,
        "resumeAnalysis.lastError": null,
        "resumeAnalysis.nextRetryAt": null,
      },
    });

    console.log(
      `[resume-analysis] completed candidate=${candidateId} attempt=${attempts}`
    );
  } catch (error) {
    const retryable = isRetryable(error) && attempts < MAX_ATTEMPTS;
    const nextRetryAt = retryable
      ? new Date(Date.now() + retryDelayMs(attempts))
      : null;

    await Candidate.findByIdAndUpdate(candidateId, {
      $set: {
        "resumeAnalysis.status": retryable ? "uploaded" : "failed",
        "resumeAnalysis.nextRetryAt": nextRetryAt,
        "resumeAnalysis.resumeFilename": filename,
        "resumeAnalysis.lastError": {
          code: error.code || "UNKNOWN",
          message: error.message,
          at: new Date(),
          retryable,
        },
      },
    });

    console.error(
      `[resume-analysis] ${retryable ? "retrying" : "failed"} candidate=${candidateId} ` +
        `attempt=${attempts}/${MAX_ATTEMPTS} code=${error.code || "UNKNOWN"} — ${error.message}`
    );
    if (error.help) console.error(`[resume-analysis] ${error.help}`);

    if (retryable) {
      schedule(candidateId, retryDelayMs(attempts));
    }
  }
}

/**
 * Crash recovery — called once after the DB connection is up.
 * Re-queues anything left mid-flight or waiting on a retry timer that died
 * with the previous process.
 */
async function recoverPendingJobs() {
  try {
    const staleBefore = new Date(Date.now() - STALE_CLAIM_MS);

    const stuck = await Candidate.find(
      {
        $or: [
          { "resumeAnalysis.status": "uploaded" },
          {
            "resumeAnalysis.status": "processing",
            "resumeAnalysis.startedAt": { $lt: staleBefore },
          },
        ],
      },
      { _id: 1 }
    ).limit(200);

    if (!stuck.length) return 0;

    console.log(`[resume-analysis] recovering ${stuck.length} pending job(s)`);
    stuck.forEach((doc, index) => {
      // Stagger so a restart does not fire every job at once.
      schedule(doc._id, index * 1000);
    });

    return stuck.length;
  } catch (error) {
    console.error("[resume-analysis] recovery failed", error.message);
    return 0;
  }
}

function getQueueStats() {
  return {
    pending: pending.length,
    active: activeWorkers,
    concurrency: MAX_CONCURRENCY,
    maxAttempts: MAX_ATTEMPTS,
  };
}

module.exports = {
  queueAnalysis,
  requeueAnalysis,
  recoverPendingJobs,
  getQueueStats,
  MAX_ATTEMPTS,
};
