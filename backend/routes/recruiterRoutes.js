const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Recruiter = require("../models/Recruiter");
const Job = require("../models/Job");
const OTP = require("../models/OTP");
const transporter = require("../config/mail");
const generateOTP = require("../utils/generateOTP");

const router = express.Router();
// SEND OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check recruiter already exists
    const recruiter = await Recruiter.findOne({
      email,
    });

    if (recruiter) {
      return res.status(400).json({
        success: false,
        message: "Recruiter already exists",
      });
    }

    // Delete previous OTP
    await OTP.deleteMany({
      email,
    });

    // Generate OTP
    const otp = generateOTP();

    // Save OTP
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(
        Date.now() + 5 * 60 * 1000
      ),
    });

    // Send Email
    await transporter.sendMail({
  from: `"AI Interview Platform" <${process.env.SENDER_EMAIL}>`,
  to: email,
  subject: "AI Interview Platform OTP",

  html: `
    <h2>Email Verification</h2>

    <p>Your OTP is:</p>

    <h1>${otp}</h1>

    <p>This OTP is valid for 5 minutes.</p>
  `,
});

    res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});
router.post("/verify-otp", async (req, res) => {
  try {
    const {
      companyName,
      recruiterName,
      designation,
      email,
      password,
      otp,
    } = req.body;

    const otpData = await OTP.findOne({ email });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (otpData.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpData._id });

      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const existingRecruiter = await Recruiter.findOne({
      email,
    });

    if (existingRecruiter) {
      return res.status(400).json({
        success: false,
        message: "Recruiter already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const recruiter = await Recruiter.create({
      companyName,
      recruiterName,
      designation,
      email,
      password: hashedPassword,
    });

    await OTP.deleteOne({
      _id: otpData._id,
    });

    res.status(201).json({
      success: true,
      message: "Recruiter Registered Successfully",
      recruiter,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});
router.post("/register", async (req, res) => {
  try {
    const {
      companyName,
      recruiterName,
      designation,
      email,
      password,
    } = req.body;

    const existingRecruiter =
      await Recruiter.findOne({ email });

    if (existingRecruiter) {
      return res.status(400).json({
        success: false,
        message: "Recruiter already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const recruiter =
      await Recruiter.create({
        companyName,
        recruiterName,
        designation,
        email,
        password: hashedPassword,
      });

    res.status(201).json({
      success: true,
      message:
        "Recruiter registered successfully",
      recruiter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const recruiter = await Recruiter.findOne({
      email,
    });

    if (!recruiter) {
      return res.status(400).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      recruiter.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: recruiter._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      recruiter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// TEMPORARY DEBUG ROUTE
router.get("/all", async (req, res) => {
  try {
    const recruiters = await Recruiter.find();

    res.json({
      success: true,
      count: recruiters.length,
      recruiters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// CREATE JOB
router.post("/jobs", async (req, res) => {
  try {
    const {
      roleName,
      openings,
      minPackage,
      maxPackage,
      workMode,
      location,
      minExperience,
      maxExperience,
      requiredSkills,
      jobDescription,
      applicationDeadline,
      workflowId,
      recruiterId,
    } = req.body;

    // Check recruiter exists
    // Debug Logs
console.log("Received recruiterId:", recruiterId);

const recruiters = await Recruiter.find();
console.log("Recruiters in DB:", recruiters);

console.log("Received recruiterId:", recruiterId);

const recruiter = await Recruiter.findOne({
  _id: recruiterId,
});

console.log("Recruiter:", recruiter);

if (!recruiter) {
  return res.status(404).json({
    success: false,
    message: "Recruiter not found",
  });
}
    const job = await Job.create({
      roleName,
      openings,
      minPackage,
      maxPackage,
      workMode,
      location,
      minExperience,
      maxExperience,
      requiredSkills,
      jobDescription,
      applicationDeadline,
      workflowId,
      createdBy: recruiterId,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// GET ALL JOBS OF RECRUITER

router.get("/jobs/:recruiterId", async (req, res) => {
  try {

    const { recruiterId } = req.params;

    const jobs = await Job.find({
      createdBy: recruiterId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      totalJobs: jobs.length,
      jobs,
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