const {
  recordMalpracticeEvent,
  getMalpracticeReport,
  getAssessmentForCandidate,
} = require("../services/malpracticeService");
const { executeCode } = require("../services/judge0Service");
const {
  resolveActorFromRequest,
} = require("../services/workflowService");

const ERROR_MESSAGES = {
  INVALID_EVENT_TYPE: "Invalid malpractice event type",
  ASSESSMENT_NOT_FOUND: "Assessment not found",
  FORBIDDEN: "Not authorized",
  ASSESSMENT_CLOSED: "Assessment already completed",
  UNAUTHORIZED: "Unauthorized",
  INVALID_LANGUAGE: "Unsupported language",
  MISSING_SOURCE: "sourceCode is required",
  JUDGE0_UNAVAILABLE: "Code execution service is unavailable",
  JUDGE0_RATE_LIMITED: "Code execution rate limit reached. Try again shortly.",
  JUDGE0_TIMEOUT: "Code execution timed out",
};

const mapError = (error) => {
  const code = error.code || "SERVER_ERROR";
  const statusCode = error.statusCode || 500;
  console.error("[assessment]", { code, statusCode, detail: error.message });
  return {
    statusCode,
    body: {
      success: false,
      message: ERROR_MESSAGES[code] || error.message || "Request failed",
      code,
    },
  };
};

exports.getOne = async (req, res) => {
  try {
    const result = await getAssessmentForCandidate(
      req.params.id,
      req.candidate._id
    );

    return res.json({
      success: true,
      assessment: {
        id: result.assessment._id,
        applicationId: result.assessment.applicationId,
        roundId: result.assessment.roundId,
        roundType: result.assessment.roundType,
        status: result.assessment.status,
        score: result.assessment.score,
        startedAt: result.assessment.startedAt,
        completedAt: result.assessment.completedAt,
      },
      settings: result.settings,
      malpracticeReport: result.report,
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.recordMalpractice = async (req, res) => {
  try {
    const { type, details, timestamp } = req.body || {};
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Event type is required",
        code: "INVALID_EVENT_TYPE",
      });
    }

    const result = await recordMalpracticeEvent(
      req.params.id,
      req.candidate._id,
      { type, details, timestamp }
    );

    return res.status(201).json({
      success: true,
      event: result.event,
      malpracticeReport: result.report,
      warningLimit: result.warningLimit,
      limitReached: result.limitReached,
      shouldAutoSubmit: result.shouldAutoSubmit,
      message: result.message,
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.getMalpractice = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const report = await getMalpracticeReport(
      req.params.id,
      actor.companyId
    );

    return res.json({
      success: true,
      ...report,
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.runCode = async (req, res) => {
  try {
    const { language, sourceCode, stdin } = req.body || {};

    console.log("[assessment/run-code] Incoming request body", {
      language,
      stdin: stdin ?? "",
      sourceCodeLength: sourceCode ? String(sourceCode).length : 0,
      sourceCodePreview: sourceCode
        ? String(sourceCode).slice(0, 200)
        : null,
      candidateId: req.candidate?._id,
    });

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "language is required",
        code: "INVALID_LANGUAGE",
      });
    }

    if (!sourceCode || !String(sourceCode).trim()) {
      return res.status(400).json({
        success: false,
        message: "sourceCode is required",
        code: "MISSING_SOURCE",
      });
    }

    console.log("[assessment/run-code] Selected language:", language);

    const result = await executeCode({
      language,
      sourceCode,
      stdin: stdin || "",
    });

    console.log("[assessment/run-code] Success result", result);

    return res.json({
      success: true,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      time: result.time,
      memory: result.memory,
    });
  } catch (error) {
    console.error("[assessment/run-code] FAILED — full error:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      httpStatus: error.httpStatus,
      missingEnv: error.missingEnv,
      details: error.details,
      stack: error.stack,
      cause: error.cause
        ? {
            name: error.cause.name,
            message: error.cause.message,
            stack: error.cause.stack,
          }
        : undefined,
    });
    // Do not swallow — full error already logged above
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};
