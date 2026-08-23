const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Recruiter = require("../models/Recruiter");
const Job = require("../models/Job");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const recruiter = await Recruiter.findOne({
      email,
    });

    if (!recruiter) {
      return res.status(400).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    if (recruiter.role !== "Recruiter") {
      return res.status(403).json({
        success: false,
        message:
          "Company admins must use company login",
      });
    }

    if (!recruiter.invitationAccepted) {
      return res.status(403).json({
        success: false,
        message:
          "Recruiter invitation has not been accepted",
      });
    }

    if (
      !recruiter.isActive ||
      recruiter.status === "inactive"
    ) {
      return res.status(403).json({
        success: false,
        message: "Recruiter account is inactive",
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
        role: recruiter.role,
        companyId: recruiter.companyId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    recruiter.lastLogin = new Date();
    await recruiter.save();

    res.status(200).json({
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

    const recruiter = await Recruiter.findOne({
      _id: recruiterId,
    });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    if (!recruiter.companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Recruiter is not linked to a company",
      });
    }

    if (
      !recruiter.invitationAccepted ||
      !recruiter.isActive ||
      recruiter.status === "inactive"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Recruiter account is not active",
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
      companyId: recruiter.companyId,
      createdBy: recruiterId,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
