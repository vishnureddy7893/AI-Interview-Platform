const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyAdmin",
      required: true,
    },

    assignedRecruiters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
      },
    ],

    title: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    workMode: {
      type: String,
      enum: ["Remote", "Hybrid", "Onsite"],
      default: "Onsite",
    },

    employmentType: {
      type: String,
      enum: [
        "Full Time",
        "Part Time",
        "Internship",
        "Contract",
      ],
      default: "Full Time",
    },

    experience: {
      type: String,
      required: true,
    },

    salaryMin: {
      type: Number,
      default: 0,
    },

    salaryMax: {
      type: Number,
      default: 0,
    },

    openings: {
      type: Number,
      default: 1,
    },

    applicationDeadline: Date,
    joiningDate: Date,

    description: String,

    responsibilities: String,

    requirements: String,

    benefits: String,

jobType: {
  type: String,
  enum: [
    "Software Development",
    "Data Science",
    "AI/ML",
    "DevOps",
    "Cloud",
    "Cyber Security",
    "Testing",
    "Other",
  ],
  default: "Software Development",
},

education: {
  type: String,
  default: "Bachelor's Degree",
},

cgpa: {
  type: Number,
  default: 0,
},

resumeScoreCutoff: {
  type: Number,
  default: 0,
},

skills: [
  {
    type: String,
  },
],

preferredSkills: [
  {
    type: String,
  },
],

workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HiringWorkflow",
      default: null,
    },

    // Embedded per-job interview rounds (Interview Workflow Builder)
    interviewWorkflow: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: [
            "Aptitude",
            "Technical",
            "Coding",
            "HR",
            "Project Discussion",
            "System Design",
          ],
          required: true,
        },
        title: {
          type: String,
          default: "",
        },
        order: {
          type: Number,
          required: true,
          min: 1,
        },
        enabled: {
          type: Boolean,
          default: true,
        },
        settings: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "Draft",
        "Published",
        "Paused",
        "Closed",
      ],
      default: "Draft",
    },

    visibility: {
      type: String,
      enum: [
        "Public",
        "Private",
        "Campus",
      ],
      default: "Public",
    },

    totalApplications: {
      type: Number,
      default: 0,
    },

    totalInterviews: {
      type: Number,
      default: 0,
    },

    totalSelected: {
      type: Number,
      default: 0,
    },

    totalRejected: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);