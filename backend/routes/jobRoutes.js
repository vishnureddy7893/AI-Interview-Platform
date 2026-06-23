const express = require("express");
const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const recruiterId =
      req.body.recruiterId || req.body.createdBy;

    if (!recruiterId) {
      return res.status(400).json({
        success: false,
        message: "Recruiter id is required",
      });
    }

    const recruiter = await Recruiter.findById(
      recruiterId
    );

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

    const job = await Job.create({
      ...req.body,
      companyId: recruiter.companyId,
      createdBy: recruiter._id,
    });

    res.status(201).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get(
  "/all/:recruiterId",
  async (req, res) => {
    try {
      const jobs =
        await Job.find({
          createdBy:
            req.params.recruiterId,
        });

      res.json({
        success: true,
        jobs,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

module.exports = router;
