const Candidate = require("../models/Candidate");
const {
  sanitizeParsedResumeForClient,
} = require("../services/resumeParseService");
const {
  getInterviewPreview,
  generateInterviewForCandidate,
  getInterviewForCandidate,
  startInterviewSession,
  submitAnswer,
  nextQuestion,
  completeInterview,
  getInterviewForCompany,
  listCompanyInterviews,
  formatQuestionEvaluation,
} = require("../services/interviewService");
const {
  resolveActorFromRequest,
} = require("../services/workflowService");

const ERROR_MESSAGES = {
  MISSING_RESUME: "Resume not found",
  RESUME_NOT_PARSED: "Resume not analyzed",
  JOB_NOT_FOUND: "Job not found",
  WORKFLOW_MISSING: "Interview workflow is missing",
  AI_RATE_LIMIT: "AI service unavailable",
  AI_TIMEOUT: "AI service unavailable",
  AI_FAILURE: "AI service unavailable",
  INVALID_AI_JSON: "Invalid AI response",
  EMPTY_INTERVIEW: "Invalid AI response",
  INCOMPLETE_INTERVIEW: "Invalid AI response",
  INTERVIEW_NOT_FOUND: "Interview not found",
  FORBIDDEN: "Not authorized",
  EMPTY_ANSWER: "Answer cannot be empty",
  MISSING_QUESTION_ID: "questionId is required",
  INVALID_QUESTION_ID: "Wrong questionId",
  WRONG_QUESTION: "Wrong questionId",
  INTERVIEW_COMPLETED: "Interview already completed",
  ANSWER_REQUIRED: "Submit the current answer first",
  INCOMPLETE_ANSWERS: "Answer all questions before completing",
  UNAUTHORIZED: "Unauthorized",
};

const mapError = (error) => {
  const code = error.code || "SERVER_ERROR";
  const statusCode = error.statusCode || 500;
  const message =
    ERROR_MESSAGES[code] || error.message || "Interview request failed";

  console.error("[interview]", { code, statusCode, detail: error.message });

  return {
    statusCode,
    body: {
      success: false,
      message,
      code,
    },
  };
};

const sanitizeInterviewForClient = (interview, { includeAnswers = true } = {}) => {
  const doc =
    typeof interview.toObject === "function"
      ? interview.toObject()
      : { ...interview };

  const job =
    doc.jobId && typeof doc.jobId === "object"
      ? {
          id: doc.jobId._id,
          title: doc.jobId.title,
          companyName: doc.jobId.companyName,
          department: doc.jobId.department,
          location: doc.jobId.location,
          experience: doc.jobId.experience,
        }
      : { id: doc.jobId };

  const questions = (doc.generatedQuestions || []).map((q) => {
    const base = {
      id: q.id,
      questionId: q.id,
      roundType: q.roundType,
      roundId: q.roundId,
      question: q.question,
      difficulty: q.difficulty,
      expectedSkills: q.expectedSkills || [],
      estimatedTime: q.estimatedTime,
      status: q.status || "pending",
      score: q.score,
      feedback: q.feedback,
      strengths: q.strengths || [],
      weaknesses: q.weaknesses || [],
      improvements: q.improvements || [],
      evaluation: q.evaluation || null,
      submittedAt: q.submittedAt,
      timeTaken: q.timeTaken,
    };

    if (includeAnswers) {
      base.candidateAnswer = q.candidateAnswer || "";
    }

    return base;
  });

  return {
    id: doc._id,
    candidateId: doc.candidateId,
    jobId: job.id || doc.jobId,
    job,
    companyId: doc.companyId,
    workflow: doc.workflow || [],
    generatedQuestions: questions,
    status: doc.status,
    currentRound: doc.currentRound,
    currentQuestionIndex: doc.currentQuestionIndex || 0,
    startedAt: doc.startedAt,
    completedAt: doc.completedAt,
    score: doc.score,
    overallScore: doc.overallScore,
    technicalScore: doc.technicalScore,
    communicationScore: doc.communicationScore,
    problemSolvingScore: doc.problemSolvingScore,
    projectKnowledgeScore: doc.projectKnowledgeScore,
    confidenceScore: doc.confidenceScore,
    overallFeedback: doc.overallFeedback,
    recommendation: doc.recommendation,
    feedback: doc.feedback,
    strengths: doc.strengths || [],
    weaknesses: doc.weaknesses || [],
    improvements: doc.improvements || [],
    roundScores: doc.roundScores || {},
    metadata: doc.metadata || {},
    createdAt: doc.createdAt,
  };
};

const publicQuestion = (question) => {
  if (!question) return null;
  return {
    id: question.id,
    questionId: question.id,
    roundType: question.roundType,
    question: question.question,
    difficulty: question.difficulty,
    expectedSkills: question.expectedSkills || [],
    estimatedTime: question.estimatedTime,
    status: question.status || "pending",
    score: question.score,
    feedback: question.feedback,
    strengths: question.strengths || [],
    weaknesses: question.weaknesses || [],
    improvements: question.improvements || [],
    evaluation: question.evaluation || null,
    candidateAnswer: question.candidateAnswer || "",
  };
};

exports.getPreview = async (req, res) => {
  try {
    const preview = await getInterviewPreview(req.params.jobId);
    return res.json({
      success: true,
      ...preview,
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.generate = async (req, res) => {
  try {
    const jobId = req.body.jobId || req.body.job_id;

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

    const interview = await generateInterviewForCandidate(candidate, jobId);

    return res.status(201).json({
      success: true,
      message: "Interview generated successfully",
      interviewId: interview._id,
      interview: sanitizeInterviewForClient(interview),
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.getOne = async (req, res) => {
  try {
    let interview = await getInterviewForCandidate(
      req.params.id,
      req.candidate._id
    );

    if (req.query.start === "true" && interview.status !== "completed") {
      interview = startInterviewSession(interview);
      await interview.save();
    }

    const payload = sanitizeInterviewForClient(interview);
    const index = payload.currentQuestionIndex || 0;
    const currentQuestion = payload.generatedQuestions[index] || null;

    return res.json({
      success: true,
      interview: payload,
      currentQuestion: publicQuestion(currentQuestion),
      totalQuestions: payload.generatedQuestions.length,
      evaluation:
        currentQuestion?.status === "evaluated"
          ? formatQuestionEvaluation(currentQuestion)
          : null,
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const result = await submitAnswer(req.params.id, req.candidate._id, {
      questionId: req.body.questionId,
      answer: req.body.answer,
      timeTaken: req.body.timeTaken,
    });

    return res.json({
      success: true,
      evaluation: result.evaluation,
      score: result.score,
      nextQuestionAvailable: result.nextQuestionAvailable,
      isLastQuestion: result.isLastQuestion,
      cached: result.cached,
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.nextQuestion = async (req, res) => {
  try {
    const result = await nextQuestion(req.params.id, req.candidate._id);

    return res.json({
      success: true,
      nextQuestion: publicQuestion(result.nextQuestion),
      completed: result.completed,
      currentQuestionIndex: result.currentQuestionIndex,
      totalQuestions: result.totalQuestions,
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.complete = async (req, res) => {
  try {
    const result = await completeInterview(req.params.id, req.candidate._id);
    const interview = sanitizeInterviewForClient(result.interview);

    return res.json({
      success: true,
      message: "Interview completed",
      cached: result.cached,
      interview,
      report: {
        overallScore: interview.overallScore,
        technicalScore: interview.technicalScore,
        communicationScore: interview.communicationScore,
        problemSolvingScore: interview.problemSolvingScore,
        projectKnowledgeScore: interview.projectKnowledgeScore,
        confidenceScore: interview.confidenceScore,
        roundScores: interview.roundScores,
        strengths: interview.strengths,
        weaknesses: interview.weaknesses,
        improvements: interview.improvements,
        overallFeedback: interview.overallFeedback,
        recommendation: interview.recommendation,
        completedAt: interview.completedAt,
        durationSeconds: interview.metadata?.durationSeconds ?? null,
        questionsAnswered: interview.metadata?.answeredCount ?? null,
      },
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.listForRecruiter = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const interviews = await listCompanyInterviews(actor.companyId);

    return res.json({
      success: true,
      interviews: interviews.map((item) => ({
        id: item._id,
        status: item.status,
        overallScore: item.overallScore,
        recommendation: item.recommendation,
        completedAt: item.completedAt,
        createdAt: item.createdAt,
        job: item.jobId
          ? { id: item.jobId._id, title: item.jobId.title }
          : null,
        candidate: item.candidateId
          ? {
              id: item.candidateId._id,
              name: item.candidateId.name,
              email: item.candidateId.email,
            }
          : null,
      })),
    });
  } catch (error) {
    const mapped = mapError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

exports.getForRecruiter = async (req, res) => {
  try {
    const actor = await resolveActorFromRequest(req);
    const interview = await getInterviewForCompany(
      req.params.id,
      actor.companyId
    );

    const payload = sanitizeInterviewForClient(interview);
    const candidateDoc =
      interview.candidateId && typeof interview.candidateId === "object"
        ? interview.candidateId
        : null;

    return res.json({
      success: true,
      interview: payload,
      candidate: candidateDoc
        ? {
            id: candidateDoc._id,
            name: candidateDoc.name,
            email: candidateDoc.email,
            phone: candidateDoc.phone,
            city: candidateDoc.city,
            college: candidateDoc.college,
            branch: candidateDoc.branch,
            skills: candidateDoc.skills || [],
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
