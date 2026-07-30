const Job = require("../models/Job");
const CompanyAdmin = require("../models/CompanyAdmin");

// Create Job
exports.createJob = async (req, res) => {
  try {
    const admin = await CompanyAdmin.findById(req.user.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      title,
      department,
      location,
      workMode,
      employmentType,
      experience,
      salaryMin,
      salaryMax,
      openings,
      applicationDeadline,
      description,
      responsibilities,
      requirements,
      benefits,
      skills,
      visibility,
    } = req.body;

    const job = await Job.create({
      companyId: admin.companyId,
      companyName: admin.companyName,
      createdBy: admin._id,

      title,
      department,
      location,
      workMode,
      employmentType,
      experience,
      salaryMin,
      salaryMax,
      openings,
      applicationDeadline,
      description,
      responsibilities,
      requirements,
      benefits,
      skills,
      visibility,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};s