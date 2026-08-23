const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");
const {
  getTopicsLibrary,
  updateJobWorkflow,
  updateJobFields,
  getJobForActor,
  archiveJob,
  resolveActorFromRequest,
} = require("../services/workflowService");
const {
  validateInterviewWorkflow,
} = require("../utils/workflowValidation");

const mapError = (error) => ({
  statusCode: error.statusCode || 500,
  body: {
    success: false,
    message: error.message || "Server Error",
    code: error.code || "SERVER_ERROR",
  },
});

/**
 * Legacy company-admin create (optional JWT). Kept for compatibility.
 * Prefer POST /job/create for recruiter job creation.
 */
exports.createJob = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);

    if (actor.role !== "CompanyAdmin") {
      return res.status(403).json({
        success: false,
        message: "Only company admins can use this endpoint",
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
      interviewWorkflow,
    } = req.body;

    let workflow = [];
    if (Array.isArray(interviewWorkflow) && interviewWorkflow.length) {
      workflow = validateInterviewWorkflow(interviewWorkflow);
    }

    const job = await Job.create({
      companyId: actor.companyId,
      companyName: actor.companyName,
      createdBy: actor._id,
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
      interviewWorkflow: workflow,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (err) {
    console.error(err);
    const mapped = mapError(err);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.getTopics = async (_req, res) => {
  try {
    return res.json({
      success: true,
      ...getTopicsLibrary(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const job = await updateJobFields(req.params.id, req.body, actor);

    return res.json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error(error);
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.archiveJob = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const job = await archiveJob(req.params.id, actor);

    return res.json({
      success: true,
      message: "Job closed successfully",
      job,
    });
  } catch (error) {
    console.error(error);
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.updateWorkflow = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const workflow = req.body.interviewWorkflow ?? req.body.workflow;

    const job = await updateJobWorkflow(req.params.id, workflow, actor);

    return res.json({
      success: true,
      message: "Interview workflow updated successfully",
      job,
    });
  } catch (error) {
    console.error(error);
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.getJob = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const job = await getJobForActor(req.params.id, actor);

    return res.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error(error);
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.listJobs = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);

    const filter = {
      companyId: actor.companyId,
      isDeleted: { $ne: true },
    };

    if (actor.role === "Recruiter") {
      filter.$or = [
        { createdBy: actor._id },
        { assignedRecruiters: actor._id },
      ];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error(error);
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.listPublishedJobs = async (_req, res) => {
  try {
    const jobs = await Job.find({
      isDeleted: { $ne: true },
      status: { $in: ["Published", "Draft"] },
      "interviewWorkflow.0": { $exists: true },
    })
      .select(
        "title companyName department location experience workMode status interviewWorkflow createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      jobs: jobs.map((job) => ({
        id: job._id,
        title: job.title,
        companyName: job.companyName,
        department: job.department,
        location: job.location,
        experience: job.experience,
        workMode: job.workMode,
        status: job.status,
        roundCount: (job.interviewWorkflow || []).filter(
          (r) => r.enabled !== false
        ).length,
        createdAt: job.createdAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
