const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const AIInterview = require("../models/AIInterview");
const aiService = require("./aiService");
const {
  sanitizeParsedResumeForClient,
} = require("./resumeParseService");
const { TOPIC_LIBRARY } = require("../config/topicLibrary");

function hasResumeFile(candidate) {
  return Boolean(candidate?.resume?.filename || candidate?.resumeUrl);
}

function hasParsedResume(candidate) {
  return Boolean(candidate?.parsedResume?.parsedAt);
}

function getEnabledWorkflow(job) {
  const workflow = Array.isArray(job.interviewWorkflow)
    ? job.interviewWorkflow
    : [];

  return workflow
    .filter((round) => round && round.enabled !== false)
    .sort((a, b) => Number(a.order) - Number(b.order));
}

function estimateDurationMinutes(workflow) {
  return workflow.reduce((total, round) => {
    const settings = round.settings || {};
    if (Number(settings.duration) > 0) {
      return total + Number(settings.duration);
    }
    const count = Number(settings.questionCount) || 0;
    return total + Math.max(count * 5, 10);
  }, 0);
}

function collectTopicsFromWorkflow(workflow) {
  const selected = new Set();

  for (const round of workflow) {
    const settings = round.settings || {};
    const lists = [
      ...(settings.topics || []),
      ...(settings.sections || []),
    ];
    lists.forEach((topic) => {
      if (topic) selected.add(String(topic));
    });
  }

  return [...selected];
}

function buildTopicContext(workflow) {
  const selectedTopics = collectTopicsFromWorkflow(workflow);

  const relevantCategories = TOPIC_LIBRARY.map((category) => ({
    category: category.category,
    topics:
      selectedTopics.length > 0
        ? category.topics.filter((t) => selectedTopics.includes(t))
        : category.topics.slice(0, 4),
  })).filter((c) => c.topics.length > 0);

  return {
    selectedTopics,
    categories: relevantCategories,
  };
}

function buildJobContext(job) {
  return {
    title: job.title,
    department: job.department,
    experience: job.experience,
    description: job.description || "",
    requirements: job.requirements || "",
    responsibilities: job.responsibilities || "",
    skills: job.skills || [],
    preferredSkills: job.preferredSkills || [],
    jobType: job.jobType,
  };
}

function average(values) {
  const nums = values.filter((v) => Number.isFinite(Number(v))).map(Number);
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function formatQuestionEvaluation(question) {
  if (!question) return null;
  return {
    questionId: question.id,
    score: question.score,
    feedback: question.feedback,
    strengths: question.strengths || [],
    weaknesses: question.weaknesses || [],
    improvements: question.improvements || [],
    evaluation: question.evaluation || null,
    status: question.status,
  };
}

function assertInterviewNotCompleted(interview) {
  if (interview.status === "completed") {
    const error = new Error("Interview already completed");
    error.code = "INTERVIEW_COMPLETED";
    error.statusCode = 409;
    throw error;
  }
}

async function getInterviewPreview(jobId) {
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

  const workflow = getEnabledWorkflow(job);

  if (!workflow.length) {
    const error = new Error("Interview workflow is missing for this job");
    error.code = "WORKFLOW_MISSING";
    error.statusCode = 422;
    throw error;
  }

  return {
    job: {
      id: job._id,
      title: job.title,
      companyName: job.companyName,
      department: job.department,
      location: job.location,
      experience: job.experience,
      description: job.description || "",
      skills: job.skills || [],
    },
    workflow: workflow.map((round) => ({
      id: round.id,
      type: round.type,
      title: round.title || round.type,
      order: round.order,
      questionCount: Number(round.settings?.questionCount) || 0,
      duration: Number(round.settings?.duration) || null,
      difficulty: round.settings?.difficulty || null,
    })),
    estimatedDurationMinutes: estimateDurationMinutes(workflow),
    instructions: [
      "Ensure your resume is uploaded and analyzed before starting.",
      "Questions are personalized from your resume, the job description, and this workflow.",
      "Answer clearly; coding rounds may ask for approach and complexity.",
      "You can refresh safely — progress is saved after each answer.",
    ],
  };
}

async function generateInterviewForCandidate(candidate, jobId, options = {}) {
  if (!hasResumeFile(candidate)) {
    const error = new Error("Resume not found. Upload a resume before starting.");
    error.code = "MISSING_RESUME";
    error.statusCode = 400;
    throw error;
  }

  if (!hasParsedResume(candidate)) {
    const error = new Error(
      "Resume not analyzed. Run Analyze Resume before starting the interview."
    );
    error.code = "RESUME_NOT_PARSED";
    error.statusCode = 400;
    throw error;
  }

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

  const workflow = Array.isArray(options.workflowOverride) && options.workflowOverride.length
    ? options.workflowOverride
    : getEnabledWorkflow(job);

  if (!workflow.length) {
    const error = new Error("Interview workflow is missing for this job");
    error.code = "WORKFLOW_MISSING";
    error.statusCode = 422;
    throw error;
  }

  const parsedResume = sanitizeParsedResumeForClient(candidate.parsedResume);
  const topicContext = buildTopicContext(workflow);
  const jobContext = buildJobContext(job);

  const aiResult = await aiService.generateInterview({
    resume: parsedResume,
    job: jobContext,
    workflow,
    topics: topicContext,
  });

  const interview = await AIInterview.create({
    candidateId: candidate._id,
    jobId: job._id,
    companyId: job.companyId,
    applicationId: options.applicationId || null,
    roundId: options.roundId || "",
    workflow,
    generatedQuestions: aiResult.questions.map((q) => ({
      ...q,
      status: "pending",
    })),
    status: "generated",
    currentRound: 1,
    currentQuestionIndex: 0,
    metadata: {
      aiVersion: aiResult.aiVersion,
      estimatedDurationMinutes: estimateDurationMinutes(workflow),
      questionCount: aiResult.questions.length,
      jobTitle: job.title,
      companyName: job.companyName,
      selectedTopics: topicContext.selectedTopics,
      jobContext,
    },
  });

  return interview;
}

async function getInterviewForCandidate(interviewId, candidateId) {
  const interview = await AIInterview.findById(interviewId).populate(
    "jobId",
    "title companyName department location experience description requirements skills"
  );

  if (!interview) {
    const error = new Error("Interview not found");
    error.code = "INTERVIEW_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  if (String(interview.candidateId) !== String(candidateId)) {
    const error = new Error("Not authorized to view this interview");
    error.code = "FORBIDDEN";
    error.statusCode = 403;
    throw error;
  }

  return interview;
}

function startInterviewSession(interview) {
  if (interview.status === "generated") {
    interview.status = "in_progress";
    interview.startedAt = interview.startedAt || new Date();
  }
  return interview;
}

async function submitAnswer(interviewId, candidateId, payload) {
  const { questionId, answer, timeTaken } = payload;
  const interview = await getInterviewForCandidate(interviewId, candidateId);

  assertInterviewNotCompleted(interview);

  if (interview.status === "generated") {
    startInterviewSession(interview);
  }

  if (!questionId) {
    const error = new Error("questionId is required");
    error.code = "MISSING_QUESTION_ID";
    error.statusCode = 400;
    throw error;
  }

  if (!answer || !String(answer).trim()) {
    const error = new Error("Answer cannot be empty");
    error.code = "EMPTY_ANSWER";
    error.statusCode = 400;
    throw error;
  }

  const index = interview.generatedQuestions.findIndex(
    (q) => q.id === questionId
  );

  if (index === -1) {
    const error = new Error("Question not found in this interview");
    error.code = "INVALID_QUESTION_ID";
    error.statusCode = 400;
    throw error;
  }

  if (index !== interview.currentQuestionIndex) {
    const error = new Error("This is not the current interview question");
    error.code = "WRONG_QUESTION";
    error.statusCode = 409;
    throw error;
  }

  const question = interview.generatedQuestions[index];

  if (question.status === "evaluated" && question.evaluation) {
    const nextIndex = index + 1;
    return {
      interview,
      evaluation: formatQuestionEvaluation(question),
      score: question.score,
      nextQuestionAvailable: nextIndex < interview.generatedQuestions.length,
      isLastQuestion: nextIndex >= interview.generatedQuestions.length,
      cached: true,
    };
  }

  const candidate = await Candidate.findById(candidateId).select(
    "parsedResume"
  );
  const resume = sanitizeParsedResumeForClient(candidate?.parsedResume) || {};
  const jobDoc =
    interview.jobId && typeof interview.jobId === "object"
      ? interview.jobId
      : await Job.findById(interview.jobId);
  const job = interview.metadata?.jobContext || buildJobContext(jobDoc || {});

  const aiResult = await aiService.evaluateAnswer({
    question: question.question,
    answer: String(answer).trim(),
    expectedSkills: question.expectedSkills || [],
    difficulty: question.difficulty,
    roundType: question.roundType,
    resume,
    job,
  });

  const evaluation = aiResult.evaluation;

  question.candidateAnswer = String(answer).trim();
  question.submittedAt = new Date();
  question.timeTaken =
    Number.isFinite(Number(timeTaken)) && Number(timeTaken) >= 0
      ? Number(timeTaken)
      : null;
  question.evaluation = evaluation;
  question.score = evaluation.score;
  question.feedback = evaluation.feedback;
  question.strengths = evaluation.strengths;
  question.weaknesses = evaluation.weaknesses;
  question.improvements = evaluation.improvements;
  question.status = "evaluated";

  interview.markModified("generatedQuestions");
  await interview.save();

  const nextIndex = index + 1;

  return {
    interview,
    evaluation: formatQuestionEvaluation(question),
    score: question.score,
    nextQuestionAvailable: nextIndex < interview.generatedQuestions.length,
    isLastQuestion: nextIndex >= interview.generatedQuestions.length,
    cached: false,
  };
}

async function nextQuestion(interviewId, candidateId) {
  const interview = await getInterviewForCandidate(interviewId, candidateId);

  assertInterviewNotCompleted(interview);

  const current = interview.generatedQuestions[interview.currentQuestionIndex];

  if (!current || current.status !== "evaluated") {
    const error = new Error("Submit and evaluate the current answer first");
    error.code = "ANSWER_REQUIRED";
    error.statusCode = 409;
    throw error;
  }

  const nextIndex = interview.currentQuestionIndex + 1;

  if (nextIndex >= interview.generatedQuestions.length) {
    return {
      interview,
      nextQuestion: null,
      completed: true,
      totalQuestions: interview.generatedQuestions.length,
    };
  }

  interview.currentQuestionIndex = nextIndex;
  const next = interview.generatedQuestions[nextIndex];
  if (next?.roundType) {
    const roundOrder =
      interview.workflow.find((r) => r.type === next.roundType)?.order ||
      interview.currentRound;
    interview.currentRound = Number(roundOrder) || interview.currentRound;
  }

  await interview.save();

  return {
    interview,
    nextQuestion: next,
    completed: false,
    currentQuestionIndex: nextIndex,
    totalQuestions: interview.generatedQuestions.length,
  };
}

function computeAggregates(questions) {
  const evaluated = questions.filter((q) => q.status === "evaluated");
  const overallScore = average(evaluated.map((q) => q.score));
  const technicalScore = average(
    evaluated.map((q) => q.evaluation?.technicalScore ?? q.score)
  );
  const communicationScore = average(
    evaluated.map((q) => q.evaluation?.communicationScore ?? q.score)
  );

  const byRound = {};
  for (const q of evaluated) {
    if (!byRound[q.roundType]) byRound[q.roundType] = [];
    byRound[q.roundType].push(q.score);
  }
  const roundScores = Object.fromEntries(
    Object.entries(byRound).map(([type, scores]) => [type, average(scores)])
  );

  const problemSolvingScore = average(
    evaluated
      .filter((q) =>
        ["Coding", "Technical", "System Design"].includes(q.roundType)
      )
      .map((q) => q.score)
  );
  const projectKnowledgeScore = average(
    evaluated
      .filter((q) => q.roundType === "Project Discussion")
      .map((q) => q.score)
  );

  return {
    overallScore,
    technicalScore,
    communicationScore,
    problemSolvingScore,
    projectKnowledgeScore,
    roundScores,
    answeredCount: evaluated.length,
  };
}

async function completeInterview(interviewId, candidateId) {
  const interview = await getInterviewForCandidate(interviewId, candidateId);

  if (interview.status === "completed" && interview.overallScore != null) {
    return { interview, cached: true };
  }

  const pending = interview.generatedQuestions.filter(
    (q) => q.status !== "evaluated"
  );
  if (pending.length) {
    const error = new Error("All questions must be answered before completion");
    error.code = "INCOMPLETE_ANSWERS";
    error.statusCode = 409;
    throw error;
  }

  const aggregates = computeAggregates(interview.generatedQuestions);
  const candidate = await Candidate.findById(candidateId).select(
    "parsedResume"
  );
  const resume = sanitizeParsedResumeForClient(candidate?.parsedResume) || {};
  const jobDoc =
    interview.jobId && typeof interview.jobId === "object"
      ? interview.jobId
      : await Job.findById(interview.jobId);
  const job = interview.metadata?.jobContext || buildJobContext(jobDoc || {});

  let report;
  try {
    const aiReport = await aiService.generateFinalReport({
      questions: interview.generatedQuestions,
      job,
      resume,
      aggregates,
    });
    report = aiReport.report;
  } catch (error) {
    console.error("[interview] final report AI fallback", error.message);
    report = {
      overallFeedback:
        aggregates.overallScore != null
          ? `Candidate completed the interview with an overall score of ${aggregates.overallScore}.`
          : "Interview completed.",
      recommendation: aiService.recommendationFromScore(aggregates.overallScore),
      strengths: interview.generatedQuestions
        .flatMap((q) => q.strengths || [])
        .slice(0, 5),
      weaknesses: interview.generatedQuestions
        .flatMap((q) => q.weaknesses || [])
        .slice(0, 5),
      improvements: interview.generatedQuestions
        .flatMap((q) => q.improvements || [])
        .slice(0, 5),
      confidenceScore:
        aggregates.communicationScore || aggregates.overallScore || 0,
    };
  }

  interview.overallScore = aggregates.overallScore;
  interview.score = aggregates.overallScore;
  interview.technicalScore = aggregates.technicalScore;
  interview.communicationScore = aggregates.communicationScore;
  interview.problemSolvingScore = aggregates.problemSolvingScore;
  interview.projectKnowledgeScore = aggregates.projectKnowledgeScore;
  interview.confidenceScore = report.confidenceScore;
  interview.overallFeedback = report.overallFeedback;
  interview.feedback = report.overallFeedback;
  interview.recommendation = report.recommendation;
  interview.strengths = report.strengths;
  interview.weaknesses = report.weaknesses;
  interview.improvements = report.improvements;
  interview.roundScores = aggregates.roundScores;
  interview.status = "completed";
  interview.completedAt = new Date();
  interview.metadata = {
    ...(interview.metadata || {}),
    answeredCount: aggregates.answeredCount,
    durationSeconds:
      interview.startedAt && interview.completedAt
        ? Math.round(
            (interview.completedAt.getTime() - interview.startedAt.getTime()) /
              1000
          )
        : null,
  };

  await interview.save();

  // Advance linked application workflow when present
  try {
    const {
      onInterviewCompleted,
    } = require("./applicationService");
    await onInterviewCompleted(interview);
  } catch (error) {
    console.error("[interview] application advance failed", error.message);
  }

  return { interview, cached: false };
}

async function getInterviewForCompany(interviewId, companyId) {
  const interview = await AIInterview.findById(interviewId)
    .populate(
      "jobId",
      "title companyName department location experience description skills"
    )
    .populate(
      "candidateId",
      "name email phone city skills college branch parsedResume resume resumeUrl"
    );

  if (!interview) {
    const error = new Error("Interview not found");
    error.code = "INTERVIEW_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  if (String(interview.companyId) !== String(companyId)) {
    const error = new Error("Not authorized to view this interview");
    error.code = "FORBIDDEN";
    error.statusCode = 403;
    throw error;
  }

  return interview;
}

async function listCompanyInterviews(companyId) {
  return AIInterview.find({ companyId })
    .populate("jobId", "title")
    .populate("candidateId", "name email")
    .sort({ createdAt: -1 })
    .limit(100);
}

module.exports = {
  getInterviewPreview,
  generateInterviewForCandidate,
  getInterviewForCandidate,
  startInterviewSession,
  submitAnswer,
  nextQuestion,
  completeInterview,
  getInterviewForCompany,
  listCompanyInterviews,
  getEnabledWorkflow,
  estimateDurationMinutes,
  formatQuestionEvaluation,
  computeAggregates,
};
