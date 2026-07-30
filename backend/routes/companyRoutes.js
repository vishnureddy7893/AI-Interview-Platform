const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Company = require("../models/Company");
const Recruiter = require("../models/Recruiter");

const router = express.Router();

const normalizeCompanyName = (companyName) =>
  companyName.trim().toLowerCase();

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;

  if (
    authHeader &&
    authHeader.startsWith("Bearer ")
  ) {
    return authHeader.split(" ")[1];
  }

  return null;
};

const createCompanyToken = (admin) =>
  jwt.sign(
    {
      id: admin._id,
      role: admin.role,
      companyId: admin.companyId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );

router.post("/register", async (req, res) => {
  try {
    const {
      companyName,
      adminName,
      email,
      password,
      website,
      industry,
      companySize,
      location,
    } = req.body;

    if (
      !companyName ||
      !adminName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, admin name, email and password are required",
      });
    }

    const normalizedName =
      normalizeCompanyName(companyName);

    const existingCompany =
      await Company.findOne({ normalizedName });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company already exists",
      });
    }

    const existingUser =
      await Recruiter.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "A user with this email already exists",
      });
    }

    const company = await Company.create({
      companyName: companyName.trim(),
      normalizedName,
      website,
      industry,
      companySize,
      location,
    });

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const admin = await Recruiter.create({
      companyName: company.companyName,
      companyId: company._id,
      recruiterName: adminName,
      name: adminName,
      designation: "Company Admin",
      email,
      password: hashedPassword,
      role: "CompanyAdmin",
      invitationAccepted: true,
      isActive: true,
      status: "active",
    });

    company.adminUser = admin._id;
    await company.save();

    const token = createCompanyToken(admin);

    res.status(201).json({
      success: true,
      message: "Company registered successfully",
      token,
      company,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        companyId: admin.companyId,
      },
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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Recruiter.findOne({
      email,
      role: "CompanyAdmin",
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Company admin not found",
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Company admin account is inactive",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const company = await Company.findById(
      admin.companyId
    );
    
    const token = createCompanyToken(admin);

    res.status(200).json({
      success: true,
      token,
      company,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        companyId: admin.companyId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const admin = await Recruiter.findOne({
      _id: decoded.id,
      role: "CompanyAdmin",
    }).select("-password");

    if (!admin || admin.role !== "CompanyAdmin") {
      return res.status(401).json({
        success: false,
        message: "Invalid company session",
      });
    }

    const company = await Company.findById(
      admin.companyId
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      company,
      user: admin,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

router.get("/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId)
      .populate(
        "adminUser",
        "recruiterName name email role isActive"
      );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
