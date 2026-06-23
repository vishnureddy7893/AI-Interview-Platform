const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      trim: true,
    },

    openings: {
      type: Number,
      required: true,
      min: 1,
    },

    minPackage: {
      type: Number,
      default: 0,
    },

    maxPackage: {
      type: Number,
      default: 0,
    },

    workMode: {
      type: String,
      enum: [
        "Onsite",
        "Remote",
        "Hybrid",
      ],
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    employmentType: {
      type: String,
      enum: [
        "Full-Time",
        "Part-Time",
        "Internship",
        "Contract",
      ],
      default: "Full-Time",
    },

    minExperience: {
      type: Number,
      default: 0,
    },

    maxExperience: {
      type: Number,
      default: 0,
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },

    applicationDeadline: {
      type: Date,
      required: true,
    },

    jobStatus: {
      type: String,
      enum: [
        "Open",
        "Closed",
        "Draft",
      ],
      default: "Open",
    },

    applicationsCount: {
      type: Number,
      default: 0,
    },

    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HiringWorkflow",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);