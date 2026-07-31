const mongoose = require("mongoose");

const malpracticeEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "TAB_SWITCH",
        "WINDOW_BLUR",
        "FULLSCREEN_EXIT",
        "COPY",
        "PASTE",
        "RIGHT_CLICK",
        "DEVTOOLS_OPEN",
        "IDLE",
        "KEYBOARD_SHORTCUT",
      ],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    warningNumber: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const malpracticeReportSchema = new mongoose.Schema(
  {
    events: {
      type: [malpracticeEventSchema],
      default: [],
    },
    warningCount: {
      type: Number,
      default: 0,
    },
    riskScore: {
      type: Number,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    counts: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastEventAt: {
      type: Date,
      default: null,
    },
    autoSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/**
 * Assessment for Aptitude / Communication / Coding playground rounds.
 * Linked to an Application; malpracticeReport stores Phase-1 integrity events.
 */
const assessmentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    roundId: {
      type: String,
      required: true,
    },
    roundType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "in_progress", "completed", "failed"],
      default: "created",
    },
    score: {
      type: Number,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    malpracticeReport: {
      type: malpracticeReportSchema,
      default: () => ({
        events: [],
        warningCount: 0,
        riskScore: 0,
        riskLevel: "Low",
        counts: {},
        lastEventAt: null,
        autoSubmitted: false,
      }),
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

assessmentSchema.index(
  { applicationId: 1, roundId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
