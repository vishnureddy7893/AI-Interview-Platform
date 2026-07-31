const mongoose = require("mongoose");

const workflowRoundSnapshotSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, default: "" },
    order: { type: Number, required: true },
    enabled: { type: Boolean, default: true },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["locked", "ready", "completed", "failed", "skipped"],
      default: "locked",
    },
    score: { type: Number, default: null },
    durationMinutes: { type: Number, default: null },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIInterview",
      default: null,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      default: null,
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

/**
 * Hiring application — workflowSnapshot is frozen at apply time.
 * Extends the legacy Application document (recruiterId / appliedAt kept).
 */
const applicationSchema = new mongoose.Schema(
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

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // Legacy field — optional when job has no assigned recruiter
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: false,
      default: null,
    },

    workflowSnapshot: {
      type: [workflowRoundSnapshotSchema],
      default: [],
    },

    status: {
      type: String,
      enum: [
        // New hiring-pipeline statuses
        "Applied",
        "Resume Screening",
        "Communication",
        "Aptitude",
        "Coding",
        "Technical",
        "Project Discussion",
        "System Design",
        "HR",
        "Completed",
        "Rejected",
        "Selected",
        // Legacy statuses (dashboard compatibility)
        "Under Review",
        "Assessment",
        "Interview",
        "Offer",
        "Hired",
      ],
      default: "Applied",
    },

    currentRound: {
      type: String,
      default: null,
    },

    completedRounds: {
      type: [String],
      default: [],
    },

    lockedRounds: {
      type: [String],
      default: [],
    },

    overallScore: {
      type: Number,
      default: null,
    },

    roundScores: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    interviewIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AIInterview",
      },
    ],

    assessmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
      },
    ],

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    /** Lightweight rollup of latest coding-assessment integrity report */
    malpracticeSummary: {
      assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
        default: null,
      },
      roundId: { type: String, default: null },
      warningCount: { type: Number, default: 0 },
      riskScore: { type: Number, default: 0 },
      riskLevel: {
        type: String,
        default: null,
      },
      lastEventAt: { type: Date, default: null },
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
