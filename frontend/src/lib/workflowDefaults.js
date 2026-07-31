export const ROUND_TYPES = [
  "Aptitude",
  "Technical",
  "Coding",
  "HR",
  "Project Discussion",
  "System Design",
];

export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];

export function defaultSettingsForType(type) {
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

export function createRound(type, order) {
  return {
    id: `round_${crypto.randomUUID()}`,
    type,
    title: type,
    order,
    enabled: true,
    settings: defaultSettingsForType(type),
  };
}

export function renumberRounds(rounds) {
  return rounds.map((round, index) => ({
    ...round,
    order: index + 1,
  }));
}

export function validateWorkflowClient(rounds) {
  if (!Array.isArray(rounds) || rounds.length === 0) {
    return "Add at least one interview round";
  }

  const enabled = rounds.filter((r) => r.enabled);
  if (enabled.length === 0) {
    return "Enable at least one round";
  }

  const orders = rounds.map((r) => Number(r.order));
  if (new Set(orders).size !== orders.length) {
    return "Duplicate round order is not allowed";
  }

  for (const round of rounds) {
    const s = round.settings || {};
    if (round.enabled === false) continue;

    if (
      ["Aptitude", "Technical", "Coding", "HR", "System Design"].includes(
        round.type
      )
    ) {
      if (Number(s.duration) <= 0) {
        return `${round.title}: duration must be greater than 0`;
      }
    }

    if (Number(s.questionCount) <= 0) {
      return `${round.title}: question count must be greater than 0`;
    }

    if (
      (round.type === "Technical" || round.type === "Coding") &&
      (!Array.isArray(s.topics) || s.topics.length === 0)
    ) {
      return `${round.title}: select at least one topic`;
    }

    if (
      round.type === "Coding" &&
      (!Array.isArray(s.language) || s.language.length === 0)
    ) {
      return `${round.title}: select at least one language`;
    }

    if (
      round.type === "Aptitude" &&
      (Number(s.passingScore) < 0 || Number(s.passingScore) > 100)
    ) {
      return `${round.title}: passing score must be 0–100`;
    }
  }

  return null;
}
