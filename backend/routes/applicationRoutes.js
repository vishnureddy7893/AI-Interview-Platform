const express = require("express");
const applicationController = require("../controllers/applicationController");
const { protectCandidate } = require("../middleware/auth");

const router = express.Router();

// Recruiter / company admin (static paths first)
router.get("/company/list", applicationController.listForRecruiter);
router.get("/company/job/:jobId", applicationController.listForJob);
router.patch("/company/:id/status", applicationController.updateStatus);
router.get("/company/:id", applicationController.getForRecruiter);

// Candidate
router.post("/apply", protectCandidate, applicationController.apply);
router.get("/my", protectCandidate, applicationController.myApplications);
router.post(
  "/:id/rounds/start",
  protectCandidate,
  applicationController.startRound
);
router.post(
  "/:id/rounds/:roundId/complete",
  protectCandidate,
  applicationController.completeAssessment
);
router.get("/:id", protectCandidate, applicationController.getOne);

module.exports = router;
