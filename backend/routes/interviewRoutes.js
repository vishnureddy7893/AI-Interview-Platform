const express = require("express");
const jobController = require("../controllers/jobController");
const interviewController = require("../controllers/interviewController");
const { protectCandidate } = require("../middleware/auth");

const router = express.Router();

// Topic library for workflow builder (public config)
router.get("/topics", jobController.getTopics);

// Recruiter / company admin read-only views (JWT via service)
router.get("/company/list", interviewController.listForRecruiter);
router.get("/company/:id", interviewController.getForRecruiter);

// Candidate AI interview APIs
router.get(
  "/preview/:jobId",
  protectCandidate,
  interviewController.getPreview
);
router.post(
  "/generate",
  protectCandidate,
  interviewController.generate
);
router.post(
  "/:id/answer",
  protectCandidate,
  interviewController.submitAnswer
);
router.post(
  "/:id/next",
  protectCandidate,
  interviewController.nextQuestion
);
router.post(
  "/:id/complete",
  protectCandidate,
  interviewController.complete
);
router.get(
  "/:id",
  protectCandidate,
  interviewController.getOne
);

module.exports = router;
