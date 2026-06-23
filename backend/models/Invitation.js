const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
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

    email: {
      type: String,
      required: true,
      lowercase: true,
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

    permissions: {
      type: [String],
      default: [],
    },

    invitationToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    accepted: {
      type: Boolean,
      default: false,
    },

    invitationAccepted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyAdmin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

invitationSchema.index(
  { companyId: 1, email: 1, accepted: 1 }
);

module.exports = mongoose.model(
  "Invitation",
  invitationSchema
);
