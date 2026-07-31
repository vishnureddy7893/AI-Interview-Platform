const express = require("express");
const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");
const jobController = require("../controllers/jobController");
const {
  validateInterviewWorkflow,
} = require("../utils/workflowValidation");

const router = express.Router();

// Static paths first (before /:id)
router.get("/topics", jobController.getTopics);
router.get("/published", jobController.listPublishedJobs);
router.get("/", jobController.listJobs);

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

    const recruiter = await Recruiter.findById(recruiterId);

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
        message: "Recruiter account is not active",
      });
    }

    const payload = { ...req.body };
    delete payload.recruiterId;

    if (
      Array.isArray(payload.interviewWorkflow) &&
      payload.interviewWorkflow.length > 0
    ) {
      payload.interviewWorkflow = validateInterviewWorkflow(
        payload.interviewWorkflow
      );
    } else {
      delete payload.interviewWorkflow;
    }

    const job = await Job.create({
      ...payload,
      companyId: recruiter.companyId,
      companyName:
        payload.companyName || recruiter.companyName,
      createdBy: recruiter._id,
    });

    res.status(201).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
      code: error.code,
    });
  }
});

router.get("/all/:recruiterId", async (req, res) => {
  try {
    const jobs = await Job.find({
      createdBy: req.params.recruiterId,
    });

    res.json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.patch("/:id/workflow", jobController.updateWorkflow);
router.get("/:id", jobController.getJob);

module.exports = router;
