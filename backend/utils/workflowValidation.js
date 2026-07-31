const {
  ROUND_TYPES,
  DIFFICULTIES,
  CODING_LANGUAGES,
} = require("../config/topicLibrary");

function defaultSettingsForType(type) {
  switch (type) {
    case "Aptitude":
      return {
        sections: [],
        difficulty: "Medium",
        questionCount: 20,
        duration: 30,
        passingScore: 60,
      };
    case "Technical":
      return {
        topics: [],
        difficulty: "Medium",
        questionCount: 8,
        duration: 45,
        adaptive: false,
      };
    case "Coding":
      return {
        topics: [],
        difficulty: "Medium",
        language: ["JavaScript"],
        questionCount: 2,
        duration: 60,
        hiddenTestCases: true,
        warningLimit: 3,
        autoSubmitOnWarningLimit: false,
        idleTimeoutSeconds: 60,
      };
    case "HR":
      return {
        questionCount: 6,
        duration: 30,
        voiceEnabled: true,
        videoEnabled: true,
        adaptive: false,
      };
    case "Project Discussion":
      return {
        useResumeProjects: true,
        questionCount: 5,
        adaptive: true,
      };
    case "System Design":
      return {
        difficulty: "Medium",
        questionCount: 2,
        duration: 45,
      };
    default:
      return {};
  }
}

function createRound({ type, order, title, settings, enabled = true, id }) {
  const roundType = ROUND_TYPES.includes(type) ? type : null;
  if (!roundType) {
    const error = new Error(`Unsupported round type: ${type}`);
    error.code = "INVALID_ROUND_TYPE";
    error.statusCode = 400;
    throw error;
  }

  return {
    id: id || `round_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type: roundType,
    title: title || roundType,
    order: Number(order),
    enabled: enabled !== false,
    settings: {
      ...defaultSettingsForType(roundType),
      ...(settings || {}),
    },
  };
}

function assertPositiveInt(value, field, { allowZero = false } = {}) {
  const num = Number(value);
  if (!Number.isFinite(num) || (!allowZero && num <= 0) || (allowZero && num < 0)) {
    const error = new Error(`Invalid ${field}`);
    error.code = "INVALID_WORKFLOW_FIELD";
    error.statusCode = 400;
    throw error;
  }
  return num;
}

function validateRoundSettings(type, settings = {}) {
  switch (type) {
    case "Aptitude": {
      assertPositiveInt(settings.questionCount, "questionCount");
      assertPositiveInt(settings.duration, "duration");
      assertPositiveInt(settings.passingScore, "passingScore", {
        allowZero: true,
      });
      if (settings.passingScore > 100) {
        const error = new Error("passingScore must be between 0 and 100");
        error.code = "INVALID_WORKFLOW_FIELD";
        error.statusCode = 400;
        throw error;
      }
      if (settings.difficulty && !DIFFICULTIES.includes(settings.difficulty)) {
        const error = new Error("Invalid difficulty");
        error.code = "INVALID_WORKFLOW_FIELD";
        error.statusCode = 400;
        throw error;
      }
      if (!Array.isArray(settings.sections)) {
        const error = new Error("Aptitude sections must be an array");
        error.code = "INVALID_WORKFLOW_FIELD";
        error.statusCode = 400;
        throw error;
      }
      break;
    }
    case "Technical": {
      assertPositiveInt(settings.questionCount, "questionCount");
      assertPositiveInt(settings.duration, "duration");
      if (!Array.isArray(settings.topics) || settings.topics.length === 0) {
        const error = new Error("Technical round requires at least one topic");
        error.code = "MISSING_TOPICS";
        error.statusCode = 400;
        throw error;
      }
      if (settings.difficulty && !DIFFICULTIES.includes(settings.difficulty)) {
        const error = new Error("Invalid difficulty");
        error.code = "INVALID_WORKFLOW_FIELD";
        error.statusCode = 400;
        throw error;
      }
      break;
    }
    case "Coding": {
      assertPositiveInt(settings.questionCount, "questionCount");
      assertPositiveInt(settings.duration, "duration");
      if (!Array.isArray(settings.topics) || settings.topics.length === 0) {
        const error = new Error("Coding round requires at least one topic");
        error.code = "MISSING_TOPICS";
        error.statusCode = 400;
        throw error;
      }
      const languages = Array.isArray(settings.language)
        ? settings.language
        : settings.language
          ? [settings.language]
          : [];
      if (!languages.length) {
        const error = new Error("Coding round requires at least one language");
        error.code = "INVALID_WORKFLOW_FIELD";
        error.statusCode = 400;
        throw error;
      }
      const invalidLang = languages.find((l) => !CODING_LANGUAGES.includes(l));
      if (invalidLang) {
        const error = new Error(`Unsupported language: ${invalidLang}`);
        error.code = "INVALID_WORKFLOW_FIELD";
        error.statusCode = 400;
        throw error;
      }
      break;
    }
    case "HR": {
      assertPositiveInt(settings.questionCount, "questionCount");
      assertPositiveInt(settings.duration, "duration");
      break;
    }
    case "Project Discussion": {
      assertPositiveInt(settings.questionCount, "questionCount");
      break;
    }
    case "System Design": {
      assertPositiveInt(settings.questionCount, "questionCount");
      assertPositiveInt(settings.duration, "duration");
      if (settings.difficulty && !DIFFICULTIES.includes(settings.difficulty)) {
        const error = new Error("Invalid difficulty");
        error.code = "INVALID_WORKFLOW_FIELD";
        error.statusCode = 400;
        throw error;
      }
      break;
    }
    default:
      break;
  }
}

/**
 * Validate and normalize interviewWorkflow array.
 * Ensures sequential order, unique orders, and at least one enabled round.
 */
function validateInterviewWorkflow(workflow) {
  if (!Array.isArray(workflow)) {
    const error = new Error("interviewWorkflow must be an array");
    error.code = "INVALID_WORKFLOW";
    error.statusCode = 400;
    throw error;
  }

  if (workflow.length === 0) {
    const error = new Error("Workflow cannot be empty");
    error.code = "EMPTY_WORKFLOW";
    error.statusCode = 400;
    throw error;
  }

  const orders = workflow.map((r) => Number(r.order));
  if (orders.some((o) => !Number.isInteger(o) || o < 1)) {
    const error = new Error("Each round must have a positive integer order");
    error.code = "INVALID_ORDER";
    error.statusCode = 400;
    throw error;
  }

  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    const error = new Error("Duplicate order values are not allowed");
    error.code = "DUPLICATE_ORDER";
    error.statusCode = 400;
    throw error;
  }

  const enabledCount = workflow.filter((r) => r.enabled !== false).length;
  if (enabledCount < 1) {
    const error = new Error("At least one round must be enabled");
    error.code = "NO_ENABLED_ROUND";
    error.statusCode = 400;
    throw error;
  }

  const sorted = [...workflow].sort(
    (a, b) => Number(a.order) - Number(b.order)
  );

  const normalized = sorted.map((round, index) => {
    if (!ROUND_TYPES.includes(round.type)) {
      const error = new Error(`Unsupported round type: ${round.type}`);
      error.code = "INVALID_ROUND_TYPE";
      error.statusCode = 400;
      throw error;
    }

    const settings = {
      ...defaultSettingsForType(round.type),
      ...(round.settings || {}),
    };

    validateRoundSettings(round.type, settings);

    return {
      id:
        round.id ||
        `round_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
      type: round.type,
      title: round.title || round.type,
      order: index + 1,
      enabled: round.enabled !== false,
      settings,
    };
  });

  return normalized;
}

module.exports = {
  defaultSettingsForType,
  createRound,
  validateInterviewWorkflow,
  validateRoundSettings,
  ROUND_TYPES,
};
