const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    activityType: {
      type: String,
      enum: [
        "Profile",
        "Resume",
        "Application",
        "Assessment",
        "Interview",
        "Offer",
        "System",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Success",
        "Info",
        "Warning",
        "Error",
      ],
      default: "Success",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Activity",
  activitySchema
);