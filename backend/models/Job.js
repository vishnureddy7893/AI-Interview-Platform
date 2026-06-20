const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
    },

    openings: {
      type: Number,
      required: true,
    },

    minPackage: Number,

    maxPackage: Number,

    workMode: {
      type: String,
      enum: [
        "Onsite",
        "Remote",
        "Hybrid",
      ],
    },

    location: String,

    minExperience: Number,

    maxExperience: Number,

    requiredSkills: [String],

    jobDescription: String,

    applicationDeadline: Date,

    workflowId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "HiringWorkflow",
    },

    createdBy: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Job",
  jobSchema
);