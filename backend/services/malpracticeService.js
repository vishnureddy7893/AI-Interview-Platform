const Assessment = require("../models/Assessment");
const Application = require("../models/Application");

/** Configurable event risk weights */
const DEFAULT_EVENT_WEIGHTS = {
  TAB_SWITCH: 10,
  WINDOW_BLUR: 5,
  FULLSCREEN_EXIT: 15,
  COPY: 10,
  PASTE: 15,
  RIGHT_CLICK: 5,
  DEVTOOLS_OPEN: 20,
  IDLE: 5,
  KEYBOARD_SHORTCUT: 10,
};

const RISK_THRESHOLDS = {
  lowMax: 20,
  mediumMax: 50,
};

const EVENT_TYPES = new Set(Object.keys(DEFAULT_EVENT_WEIGHTS));

/** Events that increment the candidate warning counter */
const WARNING_EVENT_TYPES = new Set([
  "TAB_SWITCH",
  "WINDOW_BLUR",
  "FULLSCREEN_EXIT",
  "COPY",
  "PASTE",
  "RIGHT_CLICK",
  "DEVTOOLS_OPEN",
  "IDLE",
  "KEYBOARD_SHORTCUT",
]);

const EVENT_LABELS = {
  TAB_SWITCH: "You switched tabs during the assessment.",
  WINDOW_BLUR: "The assessment window lost focus.",
  FULLSCREEN_EXIT: "You exited fullscreen mode.",
  COPY: "Copy action detected.",
  PASTE: "Paste action detected.",
  RIGHT_CLICK: "Right-click was blocked during the assessment.",
  DEVTOOLS_OPEN: "Developer tools activity detected.",
  IDLE: "You were idle for too long.",
  KEYBOARD_SHORTCUT: "A restricted keyboard shortcut was used.",
};

function emptyCounts() {
  return Object.keys(DEFAULT_EVENT_WEIGHTS).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
}

function emptyReport() {
  return {
    events: [],
    warningCount: 0,
    riskScore: 0,
    riskLevel: "Low",
    counts: emptyCounts(),
    lastEventAt: null,
    autoSubmitted: false,
  };
}

function riskLevelFromScore(score) {
  if (score <= RISK_THRESHOLDS.lowMax) return "Low";
  if (score <= RISK_THRESHOLDS.mediumMax) return "Medium";
  return "High";
}

function getWeights(customWeights = {}) {
  return { ...DEFAULT_EVENT_WEIGHTS, ...customWeights };
}

function computeRiskScore(counts, weights = DEFAULT_EVENT_WEIGHTS) {
  return Object.entries(counts || {}).reduce((total, [type, count]) => {
    const weight = weights[type] ?? 0;
    return total + weight * Number(count || 0);
  }, 0);
}

function ensureReport(assessment) {
  if (!assessment.malpracticeReport) {
    assessment.malpracticeReport = emptyReport();
  }
  if (!assessment.malpracticeReport.counts) {
    assessment.malpracticeReport.counts = emptyCounts();
  }
  if (!Array.isArray(assessment.malpracticeReport.events)) {
    assessment.malpracticeReport.events = [];
  }
  return assessment.malpracticeReport;
}

function resolveMalpracticeSettings(application, roundId) {
  const round = (application?.workflowSnapshot || []).find(
    (r) => r.id === roundId
  );
  const settings = round?.settings || {};
  return {
    warningLimit: Number(settings.warningLimit) > 0
      ? Number(settings.warningLimit)
      : 3,
    autoSubmitOnWarningLimit: Boolean(settings.autoSubmitOnWarningLimit),
    idleTimeoutSeconds: Number(settings.idleTimeoutSeconds) > 0
      ? Number(settings.idleTimeoutSeconds)
      : 60,
  };
}

/**
 * Record a malpractice event for an assessment owned by the candidate.
 */
async function recordMalpracticeEvent(
  assessmentId,
  candidateId,
  { type, details = {}, timestamp } = {}
) {
  if (!type || !EVENT_TYPES.has(type)) {
    const error = new Error("Invalid malpractice event type");
    error.code = "INVALID_EVENT_TYPE";
    error.statusCode = 400;
    throw error;
  }

  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) {
    const error = new Error("Assessment not found");
    error.code = "ASSESSMENT_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  if (String(assessment.candidateId) !== String(candidateId)) {
    const error = new Error("Not authorized");
    error.code = "FORBIDDEN";
    error.statusCode = 403;
    throw error;
  }

  if (assessment.status === "completed") {
    const error = new Error("Assessment already completed");
    error.code = "ASSESSMENT_CLOSED";
    error.statusCode = 409;
    throw error;
  }

  const application = await Application.findById(assessment.applicationId);
  const settings = resolveMalpracticeSettings(
    application,
    assessment.roundId
  );

  const report = ensureReport(assessment);
  const isWarning = WARNING_EVENT_TYPES.has(type);
  const warningNumber = isWarning ? report.warningCount + 1 : report.warningCount;

  const event = {
    type,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    details: details || {},
    warningNumber: isWarning ? warningNumber : null,
  };

  report.events.push(event);
  report.counts[type] = Number(report.counts[type] || 0) + 1;
  report.lastEventAt = event.timestamp;

  if (isWarning) {
    report.warningCount = warningNumber;
  }

  const weights = getWeights();
  report.riskScore = computeRiskScore(report.counts, weights);
  report.riskLevel = riskLevelFromScore(report.riskScore);

  const limitReached =
    isWarning && report.warningCount >= settings.warningLimit;
  const shouldAutoSubmit =
    limitReached && settings.autoSubmitOnWarningLimit && !report.autoSubmitted;

  if (shouldAutoSubmit) {
    report.autoSubmitted = true;
  }

  assessment.markModified("malpracticeReport");
  await assessment.save();

  // Mirror lightweight summary onto Application for recruiter list views
  if (application) {
    application.malpracticeSummary = {
      assessmentId: assessment._id,
      roundId: assessment.roundId,
      warningCount: report.warningCount,
      riskScore: report.riskScore,
      riskLevel: report.riskLevel,
      lastEventAt: report.lastEventAt,
    };
    await application.save();
  }

  return {
    assessment,
    event,
    report: sanitizeReport(report),
    warningLimit: settings.warningLimit,
    limitReached,
    shouldAutoSubmit,
    message: EVENT_LABELS[type] || "Suspicious activity detected.",
  };
}

function sanitizeReport(report = {}) {
  const counts = { ...emptyCounts(), ...(report.counts || {}) };
  const riskScore =
    report.riskScore != null
      ? report.riskScore
      : computeRiskScore(counts);
  return {
    events: (report.events || []).map((e) => ({
      type: e.type,
      timestamp: e.timestamp,
      details: e.details || {},
      warningNumber: e.warningNumber ?? null,
      label: EVENT_LABELS[e.type] || e.type,
    })),
    warningCount: report.warningCount || 0,
    riskScore,
    riskLevel: report.riskLevel || riskLevelFromScore(riskScore),
    counts,
    lastEventAt: report.lastEventAt || null,
    autoSubmitted: Boolean(report.autoSubmitted),
    summary: {
      tabSwitches: counts.TAB_SWITCH || 0,
      windowBlurs: counts.WINDOW_BLUR || 0,
      fullscreenExits: counts.FULLSCREEN_EXIT || 0,
      copyAttempts: counts.COPY || 0,
      pasteAttempts: counts.PASTE || 0,
      rightClickAttempts: counts.RIGHT_CLICK || 0,
      devtoolsAttempts: counts.DEVTOOLS_OPEN || 0,
      idleEvents: counts.IDLE || 0,
      keyboardShortcuts: counts.KEYBOARD_SHORTCUT || 0,
    },
  };
}

async function getMalpracticeReport(assessmentId, companyId) {
  const assessment = await Assessment.findById(assessmentId).populate(
    "candidateId",
    "name email"
  );

  if (!assessment) {
    const error = new Error("Assessment not found");
    error.code = "ASSESSMENT_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  if (String(assessment.companyId) !== String(companyId)) {
    const error = new Error("Not authorized");
    error.code = "FORBIDDEN";
    error.statusCode = 403;
    throw error;
  }

  return {
    assessmentId: assessment._id,
    applicationId: assessment.applicationId,
    roundId: assessment.roundId,
    roundType: assessment.roundType,
    status: assessment.status,
    score: assessment.score,
    candidate:
      assessment.candidateId && typeof assessment.candidateId === "object"
        ? {
            id: assessment.candidateId._id,
            name: assessment.candidateId.name,
            email: assessment.candidateId.email,
          }
        : null,
    malpracticeReport: sanitizeReport(assessment.malpracticeReport),
    weights: getWeights(),
    thresholds: RISK_THRESHOLDS,
  };
}

async function getAssessmentForCandidate(assessmentId, candidateId) {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) {
    const error = new Error("Assessment not found");
    error.code = "ASSESSMENT_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }
  if (String(assessment.candidateId) !== String(candidateId)) {
    const error = new Error("Not authorized");
    error.code = "FORBIDDEN";
    error.statusCode = 403;
    throw error;
  }

  const application = await Application.findById(assessment.applicationId);
  const settings = resolveMalpracticeSettings(
    application,
    assessment.roundId
  );

  return {
    assessment,
    settings,
    report: sanitizeReport(assessment.malpracticeReport),
  };
}

module.exports = {
  DEFAULT_EVENT_WEIGHTS,
  RISK_THRESHOLDS,
  EVENT_TYPES,
  EVENT_LABELS,
  emptyReport,
  sanitizeReport,
  computeRiskScore,
  riskLevelFromScore,
  getWeights,
  recordMalpracticeEvent,
  getMalpracticeReport,
  getAssessmentForCandidate,
  resolveMalpracticeSettings,
};
