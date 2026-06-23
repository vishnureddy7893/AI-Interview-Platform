const express = require("express");

const HiringWorkflow = require(
  "../models/HiringWorkflow"
);
const Recruiter = require("../models/Recruiter");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const {
      companyName,
      role,
      rounds,
      recruiterId,
    } = req.body;

    if (!recruiterId) {
      return res.status(400).json({
        success: false,
        message: "Recruiter id is required",
      });
    }

    const recruiter =
      await Recruiter.findById(recruiterId);

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    if (!recruiter.companyId) {
      return res.status(400).json({
        success: false,
        message: "Recruiter is not linked to a company",
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

    const workflow =
      await HiringWorkflow.create({
        companyName:
          companyName || recruiter.companyName,
        companyId: recruiter.companyId,
        role,
        rounds,
        createdBy: recruiterId,
      });

    res.json({
      success: true,
      workflow,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/all", async (req, res) => {
  try {
    const workflows =
      await HiringWorkflow.find();

    res.json({
      success: true,
      workflows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
