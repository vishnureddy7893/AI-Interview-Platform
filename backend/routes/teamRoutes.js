const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Company = require("../models/Company");
const Invitation = require("../models/Invitation");
const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");
const {
  sendRecruiterInvitationEmail,
} = require("../utils/emailService");

const router = express.Router();

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

const getCompanyAdminFromRequest = async (req) => {
  const token = getTokenFromRequest(req);

  console.log("=================================");
  console.log("TOKEN:", token);

  if (!token) {
    console.log("NO TOKEN");
    return null;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  console.log("DECODED:", decoded);

  const admin = await Recruiter.findOne({
    _id: decoded.id,
    role: "CompanyAdmin",
    isActive: true,
    isDeleted: { $ne: true },
  });

  console.log("FOUND ADMIN:", admin);

  return admin;
};

const handleRouteError = (res, error) => {
  const statusCode =
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
      ? 401
      : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 401
        ? "Invalid or expired token"
        : error.message,
    data: {},
  });
};

const buildInvitationUrl = (req, invitationToken) => {
  const frontendUrl =
    process.env.FRONTEND_URL ||
    `${req.protocol}://${req.get("host")}`;

  return `${frontendUrl}/team/accept-invitation?token=${invitationToken}`;
};

router.get("/", async (req, res) => {
  try {
    const admin =
      await getCompanyAdminFromRequest(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Company admin authorization required",
        data: {},
      });
    }
    const recruiters = await Recruiter.find({
      companyId: admin.companyId,
      role: "Recruiter",
      isDeleted: { $ne: true },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    const recruiterIds = recruiters.map(
      (recruiter) => recruiter._id
    );

    const assignedJobCounts =
      await Job.aggregate([
        {
          $match: {
            createdBy: { $in: recruiterIds },
            companyId: admin.companyId,
          },
        },
        {
          $group: {
            _id: "$createdBy",
            count: { $sum: 1 },
          },
        },
      ]);

    const countMap = assignedJobCounts.reduce(
      (counts, item) => {
        counts[item._id.toString()] = item.count;
        return counts;
      },
      {}
    );

    const team = recruiters.map((recruiter) => {
      const recruiterData =
        recruiter.toObject();

      recruiterData.assignedJobs =
        countMap[recruiter._id.toString()] || 0;

      return recruiterData;
    });

    res.status(200).json({
      success: true,
      message: "Recruiters fetched successfully",
      data: {
        recruiters: team,
      },
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.post("/invite", async (req, res) => {
  try {
    const admin =
      await getCompanyAdminFromRequest(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Company admin authorization required",
        data: {},
      });
    }

    const {
      recruiterName,
      email,
      designation,
      department,
      permissions,
    } = req.body;

    if (
      !recruiterName ||
      !email ||
      !designation ||
      !department
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Recruiter name, email, designation and department are required",
        data: {},
      });
    }

    const existingRecruiter =
      await Recruiter.findOne({ email });

    if (existingRecruiter) {
      return res.status(400).json({
        success: false,
        message:
          "A user with this email already exists",
        data: {},
      });
    }

    const existingInvitation =
      await Invitation.findOne({
        companyId: admin.companyId,
        email,
        accepted: false,
      });

    if (
      existingInvitation &&
      existingInvitation.expiresAt > new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Active invitation already exists for this email",
        data: {},
      });
    }

    const invitationToken =
      crypto.randomBytes(32).toString("hex");

    const invitation = await Invitation.create({
      companyId: admin.companyId,
      recruiterName,
      email,
      designation,
      department,
      permissions: Array.isArray(permissions)
        ? permissions
        : [],
      invitationToken,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
      accepted: false,
      invitationAccepted: false,
      createdBy: admin._id,
    });

    const invitationUrl = buildInvitationUrl(
  req,
  invitationToken
);

// Send invitation email
await sendRecruiterInvitationEmail({
  recruiterName,
  email,
  companyName: admin.companyName,
  designation,
  department,
  invitationUrl,
});

res.status(201).json({
  success: true,
  message: "Invitation created successfully",
  data: {
    invitation,
    invitationUrl,
  },
});

  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.get("/invitations", async (req, res) => {
  try {
    const admin =
      await getCompanyAdminFromRequest(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Company admin authorization required",
        data: {},
      });
    }

    const invitations = await Invitation.find({
      companyId: admin.companyId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Invitations fetched successfully",
      data: {
        invitations,
      },
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});
router.delete("/invitation/:id", async (req, res) => {
  try {
    const admin = await getCompanyAdminFromRequest(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Company admin authorization required",
        data: {},
      });
    }

    const invitation = await Invitation.findOne({
      _id: req.params.id,
      companyId: admin.companyId,
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
        data: {},
      });
    }

    if (invitation.accepted || invitation.invitationAccepted) {
      return res.status(400).json({
        success: false,
        message: "Accepted invitations cannot be deleted",
        data: {},
      });
    }

    await Invitation.findByIdAndDelete(invitation._id);

    res.status(200).json({
      success: true,
      message: "Invitation deleted successfully",
    });

  } catch (error) {
    return handleRouteError(res, error);
  }
});
router.get("/invitation/:token", async (req, res) => {
  try {
    const { token } = req.params;
    console.log("=================================");
console.log("TOKEN FROM URL:", token);

    const invitation = await Invitation.findOne({
      invitationToken: token,
    });
    console.log("INVITATION FOUND:", invitation);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
        data: {},
      });
    }

    if (invitation.accepted || invitation.invitationAccepted) {
      return res.status(400).json({
        success: false,
        message: "Invitation already accepted",
        data: {},
      });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invitation has expired",
        data: {},
      });
    }

    const company = await Company.findById(
      invitation.companyId
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      data: {
        recruiterName: invitation.recruiterName,
        email: invitation.email,
        designation: invitation.designation,
        department: invitation.department,
        companyName: company.companyName,
      },
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.post(
  "/accept-invitation",
  async (req, res) => {
    try {
      const { invitationToken, password } = req.body;

      if (!invitationToken || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Invitation token and password are required",
          data: {},
        });
      }

      const invitation = await Invitation.findOne({
        invitationToken,
      });

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found",
          data: {},
        });
      }

      if (
        invitation.accepted ||
        invitation.invitationAccepted
      ) {
        return res.status(400).json({
          success: false,
          message: "Invitation already accepted",
          data: {},
        });
      }

      if (invitation.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Invitation expired",
          data: {},
        });
      }

      const existingRecruiter =
        await Recruiter.findOne({
          email: invitation.email,
        });

      if (existingRecruiter) {
        return res.status(400).json({
          success: false,
          message: "Recruiter already exists",
          data: {},
        });
      }

      const company = await Company.findById(
        invitation.companyId
      );

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
          data: {},
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const recruiter = await Recruiter.create({
        companyName: company.companyName,
        companyId: company._id,
        recruiterName:
          invitation.recruiterName,
        designation: invitation.designation,
        department: invitation.department,
        email: invitation.email,
        password: hashedPassword,
        role: "Recruiter",
        permissions: invitation.permissions,
        invitationAccepted: true,
        isActive: true,
        isDeleted: false,
        status: "active",
      });

      invitation.accepted = true;
      invitation.invitationAccepted = true;
      await invitation.save();

      const recruiterData =
        recruiter.toObject();
      delete recruiterData.password;

      res.status(201).json({
        success: true,
        message:
          "Invitation accepted successfully",
        data: {
          recruiter: recruiterData,
        },
      });
    } catch (error) {
      return handleRouteError(res, error);
    }
  }
);

router.put("/:id", async (req, res) => {
  try {
    const admin =
      await getCompanyAdminFromRequest(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Company admin authorization required",
        data: {},
      });
    }

    const {
      designation,
      department,
      permissions,
    } = req.body;

    const updates = {};

    if (designation !== undefined) {
      updates.designation = designation;
    }

    if (department !== undefined) {
      updates.department = department;
    }

    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: "Permissions must be an array",
          data: {},
        });
      }

      updates.permissions = permissions;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
        data: {},
      });
    }

    const recruiter =
      await Recruiter.findOneAndUpdate(
        {
          _id: req.params.id,
          companyId: admin.companyId,
          role: "Recruiter",
          isDeleted: { $ne: true },
        },
        updates,
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "Recruiter updated successfully",
      data: {
        recruiter,
      },
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const admin =
      await getCompanyAdminFromRequest(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Company admin authorization required",
        data: {},
      });
    }

    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive boolean is required",
        data: {},
      });
    }

    const recruiter =
      await Recruiter.findOneAndUpdate(
        {
          _id: req.params.id,
          companyId: admin.companyId,
          role: "Recruiter",
          isDeleted: { $ne: true },
        },
        {
          isActive,
          status: isActive ? "active" : "inactive",
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: isActive
        ? "Recruiter enabled successfully"
        : "Recruiter disabled successfully",
      data: {
        recruiter,
      },
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const admin =
      await getCompanyAdminFromRequest(req);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Company admin authorization required",
        data: {},
      });
    }

    const recruiter =
      await Recruiter.findOneAndUpdate(
        {
          _id: req.params.id,
          companyId: admin.companyId,
          role: "Recruiter",
          isDeleted: { $ne: true },
        },
        {
          isActive: false,
          isDeleted: true,
          deletedAt: new Date(),
          status: "inactive",
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "Recruiter deleted successfully",
      data: {
        recruiter,
      },
    });
  } catch (error) {
    return handleRouteError(res, error);
  }
});
module.exports = router;
