const express = require("express");
const assessmentController = require("../controllers/assessmentController");
const { protectCandidate } = require("../middleware/auth");

const router = express.Router();

// Static paths before /:id
router.post("/run-code", protectCandidate, assessmentController.runCode);

router.post(
  "/:id/malpractice",
  protectCandidate,
  assessmentController.recordMalpractice
);
router.get("/:id/malpractice", assessmentController.getMalpractice);
router.get("/:id", protectCandidate, assessmentController.getOne);

module.exports = router;
