const Candidate = require("../models/Candidate");
const {
  applyResumeToCandidate,
  clearResumeFromCandidate,
  deleteResumeFile,
  formatResumeResponse,
  getResumeFilename,
} = require("../utils/resumeStorage");
const {
  sanitizeParsedResumeForClient,
} = require("../services/resumeParseService");
const {
  queueAnalysis,
  requeueAnalysis,
  MAX_ATTEMPTS,
} = require("../services/resumeAnalysisQueue");

/**
 * Status messages the candidate sees while analysis runs in the background.
 * The candidate is never blocked by this — the UI keeps profile editing open.
 */
const ANALYSIS_STATUS_COPY = {
  idle: "Upload a resume to start the analysis.",
  uploaded: "Your resume is being analyzed. You can continue completing your profile.",
  processing: "Your resume is being analyzed. You can continue completing your profile.",
  completed: "Resume analysis complete.",
  failed: "Resume analysis couldn't be completed. We'll retry automatically.",
};

const buildAnalysisStatus = (candidate) => {
  const analysis = candidate.resumeAnalysis || {};
  const status = analysis.status || "idle";
  const attempts = analysis.attempts || 0;
  const lastError = analysis.lastError || null;

  // A terminal failure the candidate can act on (bad PDF) reads differently
  // from one they cannot (service outage) — but never expose internals.
  const exhausted = status === "failed" && attempts >= MAX_ATTEMPTS;

  return {
    status,
    attempts,
    maxAttempts: MAX_ATTEMPTS,
    inProgress: status === "uploaded" || status === "processing",
    message: exhausted
      ? lastError?.retryable === false && lastError?.code
        ? PARSE_ERRORS[lastError.code]?.message ||
          "Resume analysis couldn't be completed."
        : "Resume analysis couldn't be completed. You can try again."
      : ANALYSIS_STATUS_COPY[status],
    canRetry: status === "failed" || status === "completed",
    completedAt: analysis.completedAt || null,
    updatedAt: analysis.completedAt || analysis.startedAt || analysis.queuedAt || null,
  };
};

/**
 * User-facing messages.
 *
 * Rules:
 * - Say what happened and what the candidate can do about it.
 * - Never leak model names, provider names, stack traces or config details.
 * - `retryable: false` marks problems the candidate cannot fix by retrying,
 *   so the UI can point them at support instead of a Retry button.
 */
const PARSE_ERRORS = {
  MISSING_RESUME: {
    message: "Upload a resume before running the analysis.",
    retryable: false,
  },
  INVALID_RESUME_PATH: {
    message: "We couldn't find your resume file. Please upload it again.",
    retryable: false,
  },
  RESUME_READ_ERROR: {
    message: "We couldn't open your resume file. Please upload it again.",
    retryable: false,
  },
  CORRUPT_PDF: {
    message:
      "This PDF couldn't be read. Please re-export it and upload it again.",
    retryable: false,
  },
  EMPTY_RESUME_TEXT: {
    message:
      "No readable text was found in this PDF — scanned or image-only resumes " +
      "can't be analysed. Please upload a text-based PDF.",
    retryable: false,
  },
  AI_NOT_CONFIGURED: {
    message:
      "Resume analysis is temporarily unavailable. Our team has been notified.",
    retryable: false,
  },
  AI_AUTH_FAILED: {
    message:
      "Resume analysis is temporarily unavailable. Our team has been notified.",
    retryable: false,
  },
  AI_MODEL_UNAVAILABLE: {
    message:
      "Resume analysis is temporarily unavailable. Our team has been notified.",
    retryable: false,
  },
  AI_TLS_UNTRUSTED: {
    message:
      "Resume analysis is temporarily unavailable. Our team has been notified.",
    retryable: false,
  },
  AI_NETWORK_ERROR: {
    message:
      "We couldn't reach the analysis service. Please try again in a moment.",
    retryable: true,
  },
  AI_RATE_LIMIT: {
    message:
      "Analysis is busy right now. Please try again in a minute.",
    retryable: true,
  },
  AI_TIMEOUT: {
    message: "The analysis took too long. Please try again.",
    retryable: true,
  },
  AI_UPSTREAM_ERROR: {
    message:
      "The analysis service is having trouble. Please try again shortly.",
    retryable: true,
  },
  AI_FAILURE: {
    message: "Resume analysis failed. Please try again.",
    retryable: true,
  },
  INVALID_AI_JSON: {
    message:
      "We couldn't read the analysis result. Please try again.",
    retryable: true,
  },
  EMPTY_EXTRACTION: {
    message:
      "We couldn't extract any details from this resume. Make sure it lists " +
      "your skills, education and projects as selectable text.",
    retryable: false,
  },
  SAVE_ANALYSIS_FAILED: {
    message: "We couldn't save your analysis. Please try again.",
    retryable: true,
  },
};

const mapParseError = (error) => {
  const code = error.code || "PARSE_ERROR";
  const statusCode = error.statusCode || 500;
  const entry = PARSE_ERRORS[code];
  const message = entry?.message || "Resume analysis failed. Please try again.";

  // Full technical detail stays server-side.
  console.error("[resume/parse] failed", {
    code,
    statusCode,
    detail: error.message,
    cause: error.cause?.message,
  });

  if (error.help) {
    console.error(`[resume/parse] ${error.help}`);
  }

  return {
    statusCode,
    body: {
      success: false,
      message,
      code,
      retryable: entry?.retryable ?? true,
    },
  };
};

const getResume = async (req, res) => {
  try {
    const resume = formatResumeResponse(req, req.candidate);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.json({
      success: true,
      resume,
      hasAnalysis: Boolean(req.candidate.parsedResume?.parsedAt),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadResume = async (req, res) => {
  try {
    const candidate = req.candidate;
    const existingFilename = getResumeFilename(candidate);

    if (existingFilename) {
      await deleteResumeFile(req.file.filename);
      return res.status(409).json({
        success: false,
        message:
          "Resume already exists. Use PATCH /candidate/resume to replace it.",
      });
    }

    applyResumeToCandidate(candidate, req.file);
    await candidate.save();

    // Analysis runs in the background — the response returns immediately so the
    // candidate can carry on filling in their profile.
    const analysis = await queueAnalysis(candidate._id, { reason: "upload" });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: formatResumeResponse(req, candidate),
      analysis: buildAnalysisStatus({ resumeAnalysis: analysis }),
    });
  } catch (error) {
    console.error(error);
    await deleteResumeFile(req.file?.filename);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const replaceResume = async (req, res) => {
  try {
    const candidate = req.candidate;
    const previousFilename = getResumeFilename(candidate);

    if (!previousFilename) {
      await deleteResumeFile(req.file.filename);
      return res.status(404).json({
        success: false,
        message:
          "No resume to replace. Use POST /candidate/resume to upload one.",
      });
    }

    applyResumeToCandidate(candidate, req.file);
    await candidate.save();
    // Drop the previous analysis and its attempt history — this is a new file.
    await Candidate.updateOne(
      { _id: candidate._id },
      {
        $unset: { parsedResume: 1 },
        $set: { "resumeAnalysis.attempts": 0, "resumeAnalysis.lastError": null },
      }
    );

    if (previousFilename !== req.file.filename) {
      await deleteResumeFile(previousFilename);
    }

    // The old analysis was just discarded — start a fresh one in the background.
    const analysis = await queueAnalysis(candidate._id, { reason: "replace" });

    return res.json({
      success: true,
      message: "Resume replaced successfully",
      resume: formatResumeResponse(req, candidate),
      analysis: buildAnalysisStatus({ resumeAnalysis: analysis }),
    });
  } catch (error) {
    console.error(error);
    await deleteResumeFile(req.file?.filename);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    const candidate = req.candidate;
    const filename = getResumeFilename(candidate);

    if (!filename) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    await clearResumeFromCandidate(candidate);
    await deleteResumeFile(filename);

    // Reset the job state so a future upload starts from a clean slate.
    await Candidate.updateOne(
      { _id: candidate._id },
      {
        $set: {
          "resumeAnalysis.status": "idle",
          "resumeAnalysis.attempts": 0,
          "resumeAnalysis.lastError": null,
          "resumeAnalysis.nextRetryAt": null,
        },
      }
    );

    return res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Manual re-analysis.
 *
 * This used to run the whole PDF → AI → DB pipeline inside the request, which
 * held the connection open for the length of an LLM call and gave the candidate
 * a spinner they had to sit through. It now queues the same background job and
 * returns immediately; the client polls GET /candidate/resume/analysis/status.
 *
 * Normal uploads never need this endpoint — analysis already starts on upload.
 * It exists for an explicit "Try again" after a failure.
 */
const parseResume = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.candidate._id);

    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (!getResumeFilename(candidate)) {
      return res.status(400).json({
        success: false,
        message: PARSE_ERRORS.MISSING_RESUME.message,
        code: "MISSING_RESUME",
        retryable: false,
      });
    }

    const analysis = await requeueAnalysis(candidate._id);

    return res.status(202).json({
      success: true,
      message: "Resume analysis started.",
      analysis: buildAnalysisStatus({ resumeAnalysis: analysis }),
    });
  } catch (error) {
    const mapped = mapParseError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

const getResumeAnalysis = async (req, res) => {
  try {
    const parsedResume = sanitizeParsedResumeForClient(
      req.candidate.parsedResume
    );
    const analysis = buildAnalysisStatus(req.candidate);

    // 200 with a status object rather than 404: "not analysed yet" is a normal
    // state in the background flow, not an error the client should log.
    return res.json({
      success: true,
      parsedResume: parsedResume || null,
      analysis,
    });
  } catch (error) {
    console.error("[resume/analysis]", error);
    return res.status(500).json({
      success: false,
      message: "Couldn't load your resume analysis. Please refresh the page.",
    });
  }
};

/**
 * Lightweight polling endpoint — returns only the job state, no parsed payload,
 * so the UI can poll it cheaply while the candidate keeps working.
 */
const getAnalysisStatus = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.candidate._id).select(
      "resumeAnalysis"
    );

    if (!candidate) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    return res.json({
      success: true,
      analysis: buildAnalysisStatus(candidate),
    });
  } catch (error) {
    console.error("[resume/analysis/status]", error);
    return res.status(500).json({
      success: false,
      message: "Couldn't check the analysis status.",
    });
  }
};

module.exports = {
  getResume,
  uploadResume,
  replaceResume,
  deleteResume,
  parseResume,
  getResumeAnalysis,
  getAnalysisStatus,
};
