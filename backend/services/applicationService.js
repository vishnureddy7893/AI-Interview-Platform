const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Application = require("../models/Application");
const Assessment = require("../models/Assessment");
const AIInterview = require("../models/AIInterview");

const AI_ROUND_TYPES = new Set([
  "Technical",
  "Coding",
  "HR",
  "Project Discussion",
  "System Design",
]);

const ASSESSMENT_ROUND_TYPES = new Set([
  "Aptitude",
  "Communication",
]);

function statusFromRoundType(type) {
  const map = {
    "Resume Screening": "Resume Screening",
    Communication: "Communication",
    Aptitude: "Aptitude",
    Coding: "Coding",
    Technical: "Technical",
    "Project Discussion": "Project Discussion",
    "System Design": "System Design",
    HR: "HR",
  };
  return map[type] || "Applied";
}

function buildWorkflowSnapshot(jobWorkflow = [], { hasParsedResume } = {}) {
  const enabled = (Array.isArray(jobWorkflow) ? jobWorkflow : [])
    .filter((r) => r && r.enabled !== false)
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map((round, index) => ({
      id: round.id || `round_${index + 1}`,
      type: round.type,
      title: round.title || round.type,
      order: index + 1,
      enabled: true,
      settings: round.settings || {},
      status: "locked",
      score: null,
      durationMinutes: Number(round.settings?.duration) || null,
      interviewId: null,
      assessmentId: null,
      startedAt: null,
      completedAt: null,
    }));

  // Always start with Resume Screening (auto-completes when resume is parsed)
  const screening = {
    id: "resume_screening",
    type: "Resume Screening",
    title: "Resume Screening",
    order: 0,
    enabled: true,
    settings: {},
    status: hasParsedResume ? "completed" : "ready",
    score: hasParsedResume ? 100 : null,
    durationMinutes: null,
    interviewId: null,
    assessmentId: null,
    startedAt: hasParsedResume ? new Date() : null,
    completedAt: hasParsedResume ? new Date() : null,
  };

  const rounds = [screening, ...enabled].map((round, index) => ({
    ...round,
    order: index + 1,
  }));

  // Unlock first incomplete round
  const firstOpen = rounds.find((r) => r.status !== "completed");
  if (firstOpen) {
    firstOpen.status = "ready";
  }

  return rounds;
}

function deriveRoundLists(snapshot) {
  const completedRounds = snapshot
    .filter((r) => r.status === "completed")
    .map((r) => r.id);
  const lockedRounds = snapshot
    .filter((r) => r.status === "locked")
    .map((r) => r.id);
  const current = snapshot.find((r) => r.status === "ready");
  return {
    completedRounds,
    lockedRounds,
    currentRound: current?.id || null,
    status: current
      ? statusFromRoundType(current.type)
      : snapshot.every((r) => r.status === "completed")
        ? "Completed"
        : "Applied",
  };
}

function recomputeProgress(application) {
  const lists = deriveRoundLists(application.workflowSnapshot || []);
  application.completedRounds = lists.completedRounds;
  application.lockedRounds = lists.lockedRounds;
  application.currentRound = lists.currentRound;

  if (application.status === "Rejected" || application.status === "Selected") {
    return application;
  }

  if (
    application.workflowSnapshot.length &&
    application.workflowSnapshot.every((r) => r.status === "completed")
  ) {
    application.status = "Completed";
    application.completedAt = application.completedAt || new Date();
  } else {
    application.status = lists.status;
  }

  return application;
}

function unlockNextRound(application, completedRoundId) {
  const snapshot = application.workflowSnapshot || [];
  const current = snapshot.find((r) => r.id === completedRoundId);
  if (current) {
    current.status = "completed";
    current.completedAt = current.completedAt || new Date();
  }

  const next = snapshot
    .filter((r) => r.status === "locked")
    .sort((a, b) => a.order - b.order)[0];

  if (next) {
    next.status = "ready";
  }

  application.markModified("workflowSnapshot");
  return recomputeProgress(application);
}

async function applyToJob(candidate, jobId) {
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

  if (!["Published", "Draft"].includes(job.status)) {
    const error = new Error("Job is not open for applications");
    error.code = "JOB_NOT_PUBLISHED";
    error.statusCode = 400;
    throw error;
  }

  const existing = await Application.findOne({
    candidateId: candidate._id,
    jobId: job._id,
  });

  if (existing) {
    const error = new Error("You have already applied to this job");
    error.code = "DUPLICATE_APPLICATION";
    error.statusCode = 409;
    throw error;
  }

  const hasParsedResume = Boolean(candidate.parsedResume?.parsedAt);
  const workflowSnapshot = buildWorkflowSnapshot(job.interviewWorkflow, {
    hasParsedResume,
  });

  if (workflowSnapshot.filter((r) => r.type !== "Resume Screening").length === 0) {
    const error = new Error("This job has no interview workflow configured");
    error.code = "WORKFLOW_MISSING";
    error.statusCode = 422;
    throw error;
  }

  const lists = deriveRoundLists(workflowSnapshot);

  const application = await Application.create({
    candidateId: candidate._id,
    jobId: job._id,
    companyId: job.companyId,
    recruiterId: job.createdBy || null,
    workflowSnapshot,
    status: lists.status,
    currentRound: lists.currentRound,
    completedRounds: lists.completedRounds,
    lockedRounds: lists.lockedRounds,
    startedAt: new Date(),
    appliedAt: new Date(),
  });

  await Job.updateOne(
    { _id: job._id },
    { $inc: { totalApplications: 1 } }
  );

  return application;
}

async function getApplicationForCandidate(applicationId, candidateId) {
  const application = await Application.findById(applicationId)
    .populate(
      "jobId",
      "title companyName department location experience workMode employmentType description requirements skills status"
    )
    .populate("companyId", "companyName industry location website");

  if (!application) {
    const error = new Error("Application not found");
    error.code = "APPLICATION_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  if (String(application.candidateId) !== String(candidateId)) {
    const error = new Error("Not authorized");
    error.code = "FORBIDDEN";
    error.statusCode = 403;
    throw error;
  }

  return application;
}

async function listMyApplications(candidateId) {
  return Application.find({ candidateId })
    .populate(
      "jobId",
      "title companyName department location experience workMode status"
    )
    .populate("companyId", "companyName location")
    .sort({ createdAt: -1 });
}

function buildTimeline(application) {
  return (application.workflowSnapshot || []).map((round) => ({
    id: round.id,
    type: round.type,
    title: round.title || round.type,
    order: round.order,
    status: round.status,
    score: round.score,
    durationMinutes: round.durationMinutes,
    canStart: round.status === "ready",
    interviewId: round.interviewId,
    assessmentId: round.assessmentId,
    settings: round.settings || {},
    startedAt: round.startedAt,
    completedAt: round.completedAt,
  }));
}

function moduleForRoundType(type) {
  if (type === "Resume Screening") return "resume_screening";
  if (type === "Aptitude") return "aptitude";
  if (type === "Communication") return "communication";
  if (type === "Coding") return "coding";
  if (AI_ROUND_TYPES.has(type)) return "ai_interview";
  return "unknown";
}

async function startRound(applicationId, candidateId, roundId) {
  const application = await getApplicationForCandidate(
    applicationId,
    candidateId
  );

  if (["Rejected", "Selected", "Completed"].includes(application.status)) {
    const error = new Error("Application is no longer in progress");
    error.code = "APPLICATION_CLOSED";
    error.statusCode = 409;
    throw error;
  }

  const round = (application.workflowSnapshot || []).find(
    (r) => r.id === roundId
  );

  if (!round) {
    const error = new Error("Invalid round");
    error.code = "INVALID_ROUND";
    error.statusCode = 400;
    throw error;
  }

  if (round.status === "locked") {
    const error = new Error("This round is locked");
    error.code = "ROUND_LOCKED";
    error.statusCode = 409;
    throw error;
  }

  if (round.status === "failed") {
    const error = new Error("This round has failed");
    error.code = "ROUND_FAILED";
    error.statusCode = 409;
    throw error;
  }

  const module = moduleForRoundType(round.type);

  // Resume screening: require parsed resume then complete
  if (module === "resume_screening") {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate?.parsedResume?.parsedAt) {
      return {
        application,
        module,
        redirect: "/candidate/dashboard",
        message: "Upload and analyze your resume to complete screening",
        requiresResume: true,
      };
    }

    round.status = "completed";
    round.score = 100;
    round.completedAt = new Date();
    unlockNextRound(application, round.id);
    await application.save();

    return {
      application,
      module,
      completed: true,
      redirect: null,
    };
  }

  // Reuse existing interview/assessment if already started
  if (round.interviewId && AI_ROUND_TYPES.has(round.type)) {
    return {
      application,
      module: "ai_interview",
      interviewId: round.interviewId,
      redirect: `/candidate/interview/session/${round.interviewId}`,
    };
  }

  if (round.assessmentId && ASSESSMENT_ROUND_TYPES.has(round.type)) {
    return {
      application,
      module,
      assessmentId: round.assessmentId,
      redirect: `/candidate/assessment/${module}/${application._id}/${round.id}`,
    };
  }

  if (round.type === "Coding" && !round.interviewId) {
    // Coding can use playground module (assessment) — create assessment
    const existing = await Assessment.findOne({
      applicationId: application._id,
      roundId: round.id,
    });
    if (existing) {
      round.assessmentId = existing._id;
      application.markModified("workflowSnapshot");
      await application.save();
      return {
        application,
        module: "coding",
        assessmentId: existing._id,
        redirect: `/candidate/assessment/coding/${application._id}/${round.id}`,
      };
    }

    const assessment = await Assessment.create({
      applicationId: application._id,
      candidateId,
      jobId: application.jobId,
      companyId: application.companyId,
      roundId: round.id,
      roundType: round.type,
      status: "in_progress",
      startedAt: new Date(),
    });

    round.assessmentId = assessment._id;
    round.startedAt = round.startedAt || new Date();
    if (!application.assessmentIds.some((id) => String(id) === String(assessment._id))) {
      application.assessmentIds.push(assessment._id);
    }
    application.markModified("workflowSnapshot");
    await application.save();

    return {
      application,
      module: "coding",
      assessmentId: assessment._id,
      redirect: `/candidate/assessment/coding/${application._id}/${round.id}`,
    };
  }

  if (ASSESSMENT_ROUND_TYPES.has(round.type)) {
    let assessment = await Assessment.findOne({
      applicationId: application._id,
      roundId: round.id,
    });

    if (!assessment) {
      assessment = await Assessment.create({
        applicationId: application._id,
        candidateId,
        jobId: application.jobId,
        companyId: application.companyId,
        roundId: round.id,
        roundType: round.type,
        status: "in_progress",
        startedAt: new Date(),
      });
      application.assessmentIds.push(assessment._id);
    }

    round.assessmentId = assessment._id;
    round.startedAt = round.startedAt || new Date();
    application.markModified("workflowSnapshot");
    await application.save();

    return {
      application,
      module,
      assessmentId: assessment._id,
      redirect: `/candidate/assessment/${module}/${application._id}/${round.id}`,
    };
  }

  if (AI_ROUND_TYPES.has(round.type)) {
    const existingInterview = await AIInterview.findOne({
      applicationId: application._id,
      roundId: round.id,
      candidateId,
    }).sort({ createdAt: -1 });

    if (existingInterview) {
      round.interviewId = existingInterview._id;
      application.markModified("workflowSnapshot");
      await application.save();
      return {
        application,
        module: "ai_interview",
        interviewId: existingInterview._id,
        redirect: `/candidate/interview/session/${existingInterview._id}`,
      };
    }

    const candidate = await Candidate.findById(candidateId);
    const {
      generateInterviewForCandidate,
    } = require("./interviewService");
    const singleRoundWorkflow = [
      {
        id: round.id,
        type: round.type,
        title: round.title,
        order: 1,
        enabled: true,
        settings: round.settings || {},
      },
    ];

    const interview = await generateInterviewForCandidate(
      candidate,
      application.jobId,
      {
        workflowOverride: singleRoundWorkflow,
        applicationId: application._id,
        roundId: round.id,
      }
    );

    round.interviewId = interview._id;
    round.startedAt = round.startedAt || new Date();
    if (
      !application.interviewIds.some(
        (id) => String(id) === String(interview._id)
      )
    ) {
      application.interviewIds.push(interview._id);
    }
    application.markModified("workflowSnapshot");
    await application.save();

    return {
      application,
      module: "ai_interview",
      interviewId: interview._id,
      redirect: `/candidate/interview/session/${interview._id}`,
    };
  }

  const error = new Error("Unsupported round type");
  error.code = "INVALID_ROUND";
  error.statusCode = 400;
  throw error;
}

async function completeAssessmentRound(
  applicationId,
  candidateId,
  roundId,
  { score = 70 } = {}
) {
  const application = await getApplicationForCandidate(
    applicationId,
    candidateId
  );
  const round = (application.workflowSnapshot || []).find(
    (r) => r.id === roundId
  );

  if (!round) {
    const error = new Error("Invalid round");
    error.code = "INVALID_ROUND";
    error.statusCode = 400;
    throw error;
  }

  if (round.status === "completed") {
    return { application, cached: true };
  }

  if (round.status !== "ready" && round.status !== "locked") {
    // allow in-progress via assessment
  }

  if (round.assessmentId) {
    await Assessment.updateOne(
      { _id: round.assessmentId },
      {
        status: "completed",
        score: Number(score),
        completedAt: new Date(),
      }
    );
  }

  round.score = Number(score);
  round.status = "completed";
  round.completedAt = new Date();
  application.roundScores = {
    ...(application.roundScores || {}),
    [round.type]: Number(score),
  };

  unlockNextRound(application, round.id);

  const scores = Object.values(application.roundScores || {}).filter((v) =>
    Number.isFinite(Number(v))
  );
  if (scores.length) {
    application.overallScore = Math.round(
      scores.reduce((a, b) => a + Number(b), 0) / scores.length
    );
  }

  await application.save();
  return { application, cached: false };
}

/**
 * Called when an AIInterview linked to an application is completed.
 */
async function onInterviewCompleted(interview) {
  if (!interview?.applicationId || !interview?.roundId) {
    return null;
  }

  const application = await Application.findById(interview.applicationId);
  if (!application) return null;

  const round = (application.workflowSnapshot || []).find(
    (r) => r.id === interview.roundId
  );
  if (!round) return null;

  if (round.status === "completed") {
    return application;
  }

  round.score = interview.overallScore;
  round.status = "completed";
  round.completedAt = new Date();
  round.interviewId = interview._id;
  application.roundScores = {
    ...(application.roundScores || {}),
    [round.type]: interview.overallScore,
  };

  unlockNextRound(application, round.id);

  const scores = Object.values(application.roundScores || {}).filter((v) =>
    Number.isFinite(Number(v))
  );
  if (scores.length) {
    application.overallScore = Math.round(
      scores.reduce((a, b) => a + Number(b), 0) / scores.length
    );
  }

  await application.save();
  return application;
}

async function listJobApplications(jobId, companyId) {
  const job = await Job.findById(jobId);
  if (!job || String(job.companyId) !== String(companyId)) {
    const error = new Error("Job not found");
    error.code = "JOB_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  const applications = await Application.find({ jobId })
    .populate("candidateId", "name email phone city skills college branch")
    .sort({ createdAt: -1 });

  const stats = {
    total: applications.length,
    inProgress: applications.filter(
      (a) => !["Completed", "Rejected", "Selected", "Hired"].includes(a.status)
    ).length,
    completed: applications.filter((a) =>
      ["Completed", "Selected", "Hired"].includes(a.status)
    ).length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
    selected: applications.filter((a) =>
      ["Selected", "Hired", "Offer"].includes(a.status)
    ).length,
  };

  return { job, applications, stats };
}

async function listCompanyApplications(companyId) {
  return Application.find({ companyId })
    .populate("jobId", "title")
    .populate("candidateId", "name email")
    .sort({ createdAt: -1 })
    .limit(100);
}

async function getApplicationForCompany(applicationId, companyId) {
  const application = await Application.findById(applicationId)
    .populate(
      "jobId",
      "title companyName department location experience description skills"
    )
    .populate(
      "candidateId",
      "name email phone city skills college branch parsedResume"
    );

  if (!application) {
    const error = new Error("Application not found");
    error.code = "APPLICATION_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  if (String(application.companyId) !== String(companyId)) {
    const error = new Error("Not authorized");
    error.code = "FORBIDDEN";
    error.statusCode = 403;
    throw error;
  }

  return application;
}

module.exports = {
  applyToJob,
  listMyApplications,
  getApplicationForCandidate,
  buildTimeline,
  startRound,
  completeAssessmentRound,
  onInterviewCompleted,
  listJobApplications,
  listCompanyApplications,
  getApplicationForCompany,
  moduleForRoundType,
  buildWorkflowSnapshot,
};
