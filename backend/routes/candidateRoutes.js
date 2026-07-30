const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-parse");
const askGroq = require("../groq");

const Candidate = require("../models/Candidate");

const router = express.Router();
// MULTER CONFIGURATION
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,

  fileFilter: function (
    req,
    file,
    cb
  ) {
    if (
      file.mimetype ===
      "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PDF files are allowed"
        )
      );
    }
  },
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const existingCandidate = await Candidate.findOne({
      $or: [{ email }, { phone }],
    });
    console.log("Incoming Data:", req.body);
console.log("Existing Candidate:", existingCandidate);

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
router.post("/personal-details", async (req, res) => {
  try {
    const {
      email,
      name,
      gender,
      dob,
      city,
      state,
      linkedin,
      github,
    } = req.body;

    const candidate = await Candidate.findOne({
      email,
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

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
router.post("/academic-details", async (req, res) => {
  try {
    const {
      email,
      college,
      branch,
      cgpa,
      passoutYear,
    } = req.body;

    const candidate = await Candidate.findOne({
      email,
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

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
router.post("/projects", async (req, res) => {
  try {
    const { email, project } = req.body;

    const candidate = await Candidate.findOne({
      email,
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    candidate.projects.push(
  project.trim()
);

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
router.post("/certifications", async (req, res) => {
  try {
    const { email, certification } = req.body;

    const candidate = await Candidate.findOne({
      email,
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    candidate.certifications.push(
      certification
    );

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

// VIEW ALL CANDIDATES
router.get("/all", async (req, res) => {
  try {
    const candidates = await Candidate.find();

    res.json({
      success: true,
      candidates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// UPLOAD RESUME
router.post(
  "/upload-resume",
  upload.single("resume"),
  async (req, res) => {
    try {
      const { email } = req.body;

      const candidate =
        await Candidate.findOne({
          email,
        });

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message:
            "Candidate not found",
        });
      }

      candidate.resumeUrl =
        req.file.filename;

      await candidate.save();

      res.json({
        success: true,
        message:
          "Resume uploaded successfully",
        resumeUrl:
          req.file.filename,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
// GET SINGLE CANDIDATE
router.get("/profile/:email", async (req, res) => {
  try {
    const candidate =
      await Candidate.findOne({
        email: req.params.email,
      });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    res.json({
      success: true,
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// AI RESUME PARSING
router.post("/parse-resume", async (req, res) => {
  try {
    const { email } = req.body;

    const candidate =
      await Candidate.findOne({ email });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!candidate.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: "Resume not uploaded",
      });
    }

    const resumePath = path.join(
      __dirname,
      "../uploads",
      candidate.resumeUrl
    );

    const dataBuffer =
      fs.readFileSync(resumePath);

    const pdfData = await pdf(dataBuffer);

    const resumeText =
      pdfData.text;

    const prompt = `
You are an expert technical recruiter.

Extract technical skills from this resume.

Return ONLY valid JSON.

Format:

{
  "programmingLanguages": [],
  "frameworks": [],
  "databases": [],
  "tools": [],
  "concepts": []
}

Do NOT return explanations.
Do NOT return markdown.

Resume:
${resumeText}
`;
const skillsText =
  await askGroq(prompt);
    const parsedSkills =
  JSON.parse(skillsText);

const skills = [
  ...parsedSkills.programmingLanguages,
  ...parsedSkills.frameworks,
  ...parsedSkills.databases,
  ...parsedSkills.tools,
  ...parsedSkills.concepts,
];

candidate.skills = skills;

    await candidate.save();

    res.json({
      success: true,
      skills,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = router;
