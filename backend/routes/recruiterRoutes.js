const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Recruiter = require("../models/Recruiter");

const router = express.Router();
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
module.exports = router;