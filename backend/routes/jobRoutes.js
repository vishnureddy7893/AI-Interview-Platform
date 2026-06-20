const express = require("express");
const Job = require("../models/Job");

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const job = await Job.create(req.body);

    res.json({
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