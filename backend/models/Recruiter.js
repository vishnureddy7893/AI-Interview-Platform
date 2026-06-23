const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    recruiterName: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "active",
        "inactive",
      ],
      default: "pending",
    },

    role: {
      type: String,
      enum: ["CompanyAdmin", "Recruiter"],
      default: "Recruiter",
    },

    permissions: {
      type: [String],
      default: [],
    },

    assignedJobs: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    invitationAccepted: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
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
