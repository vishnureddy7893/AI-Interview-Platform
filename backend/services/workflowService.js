const Job = require("../models/Job");
const Recruiter = require("../models/Recruiter");
const {
  TOPIC_LIBRARY,
  CODING_LANGUAGES,
  ROUND_TYPES,
  DIFFICULTIES,
} = require("../config/topicLibrary");
const {
  validateInterviewWorkflow,
  defaultSettingsForType,
} = require("../utils/workflowValidation");

function getTopicsLibrary() {
  return {
    categories: TOPIC_LIBRARY,
    codingLanguages: CODING_LANGUAGES,
    roundTypes: ROUND_TYPES,
    difficulties: DIFFICULTIES,
    defaultSettings: ROUND_TYPES.reduce((acc, type) => {
      acc[type] = defaultSettingsForType(type);
      return acc;
    }, {}),
  };
}

async function assertJobAccess(jobId, actor) {
  const job = await Job.findOne({
    _id: jobId,
    isDeleted: { $ne: true },
  });

  if (!job) {
    const error = new Error("Job not found");
    error.code = "JOB_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  const sameCompany =
    String(job.companyId) === String(actor.companyId);

  if (!sameCompany) {
    const error = new Error("Not authorized to update this job");
    error.code = "FORBIDDEN";
    error.statusCode = 403;
    throw error;
  }

  return job;
}

async function updateJobWorkflow(jobId, workflow, actor) {
  const job = await assertJobAccess(jobId, actor);
  const normalized = validateInterviewWorkflow(workflow);

  job.interviewWorkflow = normalized;
  await job.save();

  return job;
}

async function getJobForActor(jobId, actor) {
  return assertJobAccess(jobId, actor);
}

async function resolveActorFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Authorization token is required");
    error.code = "UNAUTHORIZED";
    error.statusCode = 401;
    throw error;
  }

  const jwt = require("jsonwebtoken");
  let decoded;
  try {
    decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );
  } catch {
    const error = new Error("Invalid or expired token");
    error.code = "UNAUTHORIZED";
    error.statusCode = 401;
    throw error;
  }

  const user = await Recruiter.findById(decoded.id).select("-password");
  if (!user || !user.isActive || user.status === "inactive") {
    const error = new Error("Unauthorized");
    error.code = "UNAUTHORIZED";
    error.statusCode = 401;
    throw error;
  }

  if (!["Recruiter", "CompanyAdmin"].includes(user.role)) {
    const error = new Error("Unauthorized");
    error.code = "UNAUTHORIZED";
    error.statusCode = 401;
    throw error;
  }

  if (user.role === "Recruiter" && !user.invitationAccepted) {
    const error = new Error("Recruiter invitation has not been accepted");
    error.code = "FORBIDDEN";
    error.statusCode = 403;
    throw error;
  }

  return user;
}

module.exports = {
  getTopicsLibrary,
  updateJobWorkflow,
  getJobForActor,
  resolveActorFromRequest,
};
