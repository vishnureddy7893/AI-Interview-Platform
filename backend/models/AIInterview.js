const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    score: { type: Number, default: null },
    technicalScore: { type: Number, default: null },
    communicationScore: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

const generatedQuestionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    roundType: {
      type: String,
      required: true,
    },
    roundId: {
      type: String,
      default: "",
    },
    question: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      default: "Medium",
    },
    expectedSkills: {
      type: [String],
      default: [],
    },
    estimatedTime: {
      type: Number,
      default: 5,
    },
    candidateAnswer: {
      type: String,
      default: "",
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    timeTaken: {
      type: Number,
      default: null,
    },
    evaluation: {
      type: evaluationSchema,
      default: undefined,
    },
    score: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "answered", "evaluated"],
      default: "pending",
    },
  },
  { _id: false }
);

const aiInterviewSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
      index: true,
    },

    roundId: {
      type: String,
      default: "",
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    workflow: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    generatedQuestions: {
      type: [generatedQuestionSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["generated", "in_progress", "completed", "abandoned"],
      default: "generated",
    },

    currentRound: {
      type: Number,
      default: 1,
    },

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    score: {
      type: Number,
      default: null,
    },

    overallScore: {
      type: Number,
      default: null,
    },

    technicalScore: {
      type: Number,
      default: null,
    },

    communicationScore: {
      type: Number,
      default: null,
    },

    problemSolvingScore: {
      type: Number,
      default: null,
    },

    projectKnowledgeScore: {
      type: Number,
      default: null,
    },

    confidenceScore: {
      type: Number,
      default: null,
    },

    overallFeedback: {
      type: String,
      default: "",
    },

    recommendation: {
      type: String,
      enum: [
        "Excellent",
        "Good",
        "Average",
        "Needs Improvement",
        "",
      ],
      default: "",
    },

    feedback: {
      type: String,
      default: "",
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    roundScores: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

aiInterviewSchema.index({ candidateId: 1, jobId: 1, createdAt: -1 });

module.exports = mongoose.model("AIInterview", aiInterviewSchema);
