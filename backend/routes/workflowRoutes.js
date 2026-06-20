const express = require("express");

const HiringWorkflow = require(
  "../models/HiringWorkflow"
);

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const {
      companyName,
      role,
      rounds,
      recruiterId,
    } = req.body;

    const workflow =
      await HiringWorkflow.create({
        companyName,
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