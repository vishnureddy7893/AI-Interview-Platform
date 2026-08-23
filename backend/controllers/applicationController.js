const Candidate = require("../models/Candidate");
const {
  applyToJob,
  listMyApplications,
  getApplicationForCandidate,
  buildTimeline,
  startRound,
  completeAssessmentRound,
  listJobApplications,
  listCompanyApplications,
  getApplicationForCompany,
  updateRecruiterStatus,
} = require("../services/applicationService");
const {
  resolveActorFromRequest,
} = require("../services/workflowService");
const {
  sanitizeParsedResumeForClient,
} = require("../services/resumeParseService");

const ERROR_MESSAGES = {
  JOB_NOT_FOUND: "Job not found",
  JOB_NOT_PUBLISHED: "Job is not open for applications",
  DUPLICATE_APPLICATION: "You have already applied to this job",
  WORKFLOW_MISSING: "Interview workflow is missing",
  APPLICATION_NOT_FOUND: "Application not found",
  FORBIDDEN: "Not authorized",
  APPLICATION_CLOSED: "Application is no longer in progress",
  INVALID_ROUND: "Invalid round",
  ROUND_LOCKED: "This round is locked",
  ROUND_FAILED: "This round has failed",
  UNAUTHORIZED: "Unauthorized",
  INVALID_STATUS_TRANSITION: "That status change is not allowed",
};

const mapError = (error) => {
  const code = error.code || "SERVER_ERROR";
  const statusCode = error.statusCode || 500;
  console.error("[application]", { code, statusCode, detail: error.message });
  return {
    statusCode,
    body: {
      success: false,
      message: ERROR_MESSAGES[code] || error.message || "Request failed",
      code,
    },
  };
};

const sanitizeApplication = (application) => {
  const doc =
    typeof application.toObject === "function"
      ? application.toObject()
      : { ...application };

  const job =
    doc.jobId && typeof doc.jobId === "object"
      ? {
          id: doc.jobId._id,
          title: doc.jobId.title,
          companyName: doc.jobId.companyName,
          department: doc.jobId.department,
          location: doc.jobId.location,
          experience: doc.jobId.experience,
          workMode: doc.jobId.workMode,
          employmentType: doc.jobId.employmentType,
          description: doc.jobId.description,
          requirements: doc.jobId.requirements,
          skills: doc.jobId.skills || [],
          status: doc.jobId.status,
        }
      : { id: doc.jobId };

  const company =
    doc.companyId && typeof doc.companyId === "object"
      ? {
          id: doc.companyId._id,
          companyName: doc.companyId.companyName || job.companyName,
          industry: doc.companyId.industry,
          location: doc.companyId.location,
          website: doc.companyId.website,
        }
      : {
          id: doc.companyId,
          companyName: job.companyName,
        };

  return {
    id: doc._id,
    candidateId: doc.candidateId,
    jobId: job.id || doc.jobId,
    job,
    company,
    status: doc.status,
    recruiterStatus: doc.recruiterStatus,
    currentRound: doc.currentRound,
    completedRounds: doc.completedRounds || [],
    lockedRounds: doc.lockedRounds || [],
    overallScore: doc.overallScore,
    roundScores: doc.roundScores || {},
    interviewIds: doc.interviewIds || [],
    assessmentIds: doc.assessmentIds || [],
    workflowSnapshot: doc.workflowSnapshot || [],
    timeline: buildTimeline(application),
    malpracticeSummary: doc.malpracticeSummary || null,
    startedAt: doc.startedAt,
    completedAt: doc.completedAt,
    appliedAt: doc.appliedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

exports.apply = async (req, res) => {
  try {
    const jobId = req.body.jobId;
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "jobId is required",
        code: "MISSING_JOB_ID",
      });
    }

    const candidate = await Candidate.findById(req.candidate._id);
    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const application = await applyToJob(candidate, jobId);
    const populated = await getApplicationForCandidate(
      application._id,
      candidate._id
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: sanitizeApplication(populated),
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.myApplications = async (req, res) => {
  try {
    const applications = await listMyApplications(req.candidate._id);
    return res.json({
      success: true,
      applications: applications.map((app) => sanitizeApplication(app)),
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.getOne = async (req, res) => {
  try {
    const application = await getApplicationForCandidate(
      req.params.id,
      req.candidate._id
    );

    return res.json({
      success: true,
      application: sanitizeApplication(application),
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.startRound = async (req, res) => {
  try {
    const roundId = req.body.roundId || req.params.roundId;
    if (!roundId) {
      return res.status(400).json({
        success: false,
        message: "roundId is required",
        code: "INVALID_ROUND",
      });
    }

    const result = await startRound(
      req.params.id,
      req.candidate._id,
      roundId
    );

    return res.json({
      success: true,
      module: result.module,
      redirect: result.redirect,
      interviewId: result.interviewId || null,
      assessmentId: result.assessmentId || null,
      requiresResume: Boolean(result.requiresResume),
      completed: Boolean(result.completed),
      message: result.message || null,
      application: sanitizeApplication(result.application),
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.completeAssessment = async (req, res) => {
  try {
    const result = await completeAssessmentRound(
      req.params.id,
      req.candidate._id,
      req.body.roundId || req.params.roundId,
      { score: req.body.score }
    );

    return res.json({
      success: true,
      cached: result.cached,
      application: sanitizeApplication(result.application),
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.listForRecruiter = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const applications = await listCompanyApplications(actor.companyId);

    return res.json({
      success: true,
      applications: applications.map((app) => {
        const payload = sanitizeApplication(app);
        payload.candidate =
          app.candidateId && typeof app.candidateId === "object"
            ? {
                id: app.candidateId._id,
                name: app.candidateId.name,
                email: app.candidateId.email,
              }
            : null;
        return payload;
      }),
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.listForJob = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const result = await listJobApplications(req.params.jobId, actor.companyId);

    return res.json({
      success: true,
      job: {
        id: result.job._id,
        title: result.job.title,
      },
      stats: result.stats,
      applications: result.applications.map((app) => {
        const payload = sanitizeApplication(app);
        payload.candidate =
          app.candidateId && typeof app.candidateId === "object"
            ? {
                id: app.candidateId._id,
                name: app.candidateId.name,
                email: app.candidateId.email,
                phone: app.candidateId.phone,
                skills: app.candidateId.skills || [],
              }
            : null;
        return payload;
      }),
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const nextStatus = req.body.recruiterStatus || req.body.status;

    if (!nextStatus) {
      return res.status(400).json({
        success: false,
        message: "recruiterStatus is required",
        code: "MISSING_STATUS",
      });
    }

    const application = await updateRecruiterStatus(
      req.params.id,
      actor.companyId,
      nextStatus
    );

    return res.json({
      success: true,
      message: "Application status updated",
      application: sanitizeApplication(application),
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.getForRecruiter = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const application = await getApplicationForCompany(
      req.params.id,
      actor.companyId
    );

    const candidateDoc =
      application.candidateId && typeof application.candidateId === "object"
        ? application.candidateId
        : null;

    return res.json({
      success: true,
      application: sanitizeApplication(application),
      candidate: candidateDoc
        ? {
            id: candidateDoc._id,
            name: candidateDoc.name,
            email: candidateDoc.email,
            phone: candidateDoc.phone,
            skills: candidateDoc.skills || [],
            college: candidateDoc.college,
            branch: candidateDoc.branch,
            resumeSummary: sanitizeParsedResumeForClient(
              candidateDoc.parsedResume
            ),
          }
        : null,
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};
