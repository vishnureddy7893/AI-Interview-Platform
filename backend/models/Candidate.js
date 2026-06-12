
const mongoose = require("mongoose");
const candidateSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    name: String,

    gender: String,

    dob: Date,

    city: String,

    state: String,

    linkedin: String,

    github: String,

    college: String,

    branch: String,

    cgpa: Number,

    passoutYear: Number,

    skills: [String],

    certifications: [String],

    projects: [String],

    resumeUrl: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Candidate",
  candidateSchema
);