const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },

    recruiterName: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Recruiter",
  recruiterSchema
);