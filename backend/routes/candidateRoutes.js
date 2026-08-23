const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Candidate = require("../models/Candidate");
const { protectCandidate } = require("../middleware/auth");
const { handleResumeUpload } = require("../middleware/uploadResume");
const {
  applyResumeToCandidate,
  deleteResumeFile,
  getResumeFilename,
} = require("../utils/resumeStorage");
const resumeController = require("../controllers/resumeController");

const router = express.Router();

// Resume management (authenticated)
router.get(
  "/resume",
  protectCandidate,
  resumeController.getResume
);
router.get(
  "/resume/analysis",
  protectCandidate,
  resumeController.getResumeAnalysis
);
// Cheap polling endpoint for the background analysis job.
router.get(
  "/resume/analysis/status",
  protectCandidate,
  resumeController.getAnalysisStatus
);
router.post(
  "/resume",
  protectCandidate,
  handleResumeUpload,
  resumeController.uploadResume
);
router.post(
  "/resume/parse",
  protectCandidate,
  resumeController.parseResume
);
router.patch(
  "/resume",
  protectCandidate,
  handleResumeUpload,
  resumeController.replaceResume
);
router.delete(
  "/resume",
  protectCandidate,
  resumeController.deleteResume
);

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const existingCandidate = await Candidate.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: "Email or Phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const candidate = await Candidate.create({
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      candidate: {
        _id: candidate._id,
        email: candidate.email,
        phone: candidate.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const candidate = await Candidate.findOne({
      email,
    });

    if (!candidate) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      candidate.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: candidate._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    res.json({
      success: true,
      token,
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PERSONAL DETAILS
router.post("/personal-details", protectCandidate, async (req, res) => {
  try {
    const { name, gender, dob, city, state, linkedin, github } = req.body;

    const candidate = req.candidate;

    candidate.name = name;
    candidate.gender = gender;
    candidate.dob = dob;
    candidate.city = city;
    candidate.state = state;
    candidate.linkedin = linkedin;
    candidate.github = github;

    await candidate.save();

    res.json({
      success: true,
      message: "Personal details saved successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ACADEMIC DETAILS
router.post("/academic-details", protectCandidate, async (req, res) => {
  try {
    const { college, branch, cgpa, passoutYear } = req.body;

    const candidate = req.candidate;

    candidate.college = college;
    candidate.branch = branch;
    candidate.cgpa = cgpa;
    candidate.passoutYear = passoutYear;

    await candidate.save();

    res.json({
      success: true,
      message: "Academic details saved successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PROJECTS
router.post("/projects", protectCandidate, async (req, res) => {
  try {
    const { project } = req.body;

    const candidate = req.candidate;

    candidate.projects.push(project.trim());

    await candidate.save();

    res.json({
      success: true,
      message: "Project added successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CERTIFICATIONS
router.post("/certifications", protectCandidate, async (req, res) => {
  try {
    const { certification } = req.body;

    const candidate = req.candidate;

    candidate.certifications.push(certification);

    await candidate.save();

    res.json({
      success: true,
      message: "Certification added successfully",
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET AUTHENTICATED CANDIDATE PROFILE
router.get("/profile", protectCandidate, async (req, res) => {
  try {
    res.json({
      success: true,
      candidate: req.candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Deprecated: prefer POST/PATCH /candidate/resume.
// Kept for compatibility; requires authenticated candidate (ignores body email).
router.post(
  "/upload-resume",
  protectCandidate,
  handleResumeUpload,
  async (req, res) => {
    try {
      const candidate = req.candidate;
      const previousFilename = getResumeFilename(candidate);

      applyResumeToCandidate(candidate, req.file);
      await candidate.save();

      if (
        previousFilename &&
        previousFilename !== req.file.filename
      ) {
        await deleteResumeFile(previousFilename);
      }

      res.json({
        success: true,
        message: "Resume uploaded successfully",
        resumeUrl: req.file.filename,
      });
    } catch (error) {
      console.error(error);
      await deleteResumeFile(req.file?.filename);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
module.exports = router;
