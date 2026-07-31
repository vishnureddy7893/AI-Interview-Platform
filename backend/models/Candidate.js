
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

    // Legacy filename field — kept for backward compatibility
    resumeUrl: String,

    resume: {
      filename: String,
      originalName: String,
      size: Number,
      url: String,
      uploadedAt: Date,
    },

    parsedResume: {
      personal: {
        name: String,
        email: String,
        phone: String,
        location: String,
      },
      education: [
        {
          degree: String,
          university: String,
          year: String,
          cgpa: String,
        },
      ],
      skills: {
        programmingLanguages: [String],
        frameworks: [String],
        libraries: [String],
        databases: [String],
        cloud: [String],
        tools: [String],
        softSkills: [String],
      },
      projects: [
        {
          title: String,
          description: String,
          technologies: [String],
        },
      ],
      experience: [
        {
          company: String,
          role: String,
          duration: String,
          description: String,
        },
      ],
      certifications: [String],
      achievements: [String],
      languages: [String],
      parsedAt: Date,
      aiVersion: String,
      rawResponse: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Candidate",
  candidateSchema
);