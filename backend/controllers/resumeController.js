const Candidate = require("../models/Candidate");
const {
  applyResumeToCandidate,
  clearResumeFromCandidate,
  deleteResumeFile,
  formatResumeResponse,
  getResumeFilename,
} = require("../utils/resumeStorage");
const {
  parseCandidateResume,
  sanitizeParsedResumeForClient,
} = require("../services/resumeParseService");

const PARSE_ERROR_MESSAGES = {
  MISSING_RESUME: "Resume not found",
  INVALID_RESUME_PATH: "Resume not found",
  RESUME_READ_ERROR: "Failed to read PDF",
  CORRUPT_PDF: "Failed to read PDF",
  EMPTY_RESUME_TEXT: "Failed to read PDF",
  AI_RATE_LIMIT: "AI service unavailable",
  AI_TIMEOUT: "AI service unavailable",
  AI_FAILURE: "AI service unavailable",
  INVALID_AI_JSON: "Invalid AI response",
  EMPTY_EXTRACTION: "Invalid AI response",
  SAVE_ANALYSIS_FAILED: "Failed to save analysis",
};

const mapParseError = (error) => {
  const code = error.code || "PARSE_ERROR";
  const statusCode = error.statusCode || 500;
  const message =
    PARSE_ERROR_MESSAGES[code] ||
    error.message ||
    "Resume analysis failed";

  console.error("[resume/parse]", {
    code,
    statusCode,
    message,
    detail: error.message,
  });

  return {
    statusCode,
    body: {
      success: false,
      message,
      code,
    },
  };
};

const getResume = async (req, res) => {
  try {
    const resume = formatResumeResponse(req, req.candidate);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    return res.json({
      success: true,
      resume,
      hasAnalysis: Boolean(req.candidate.parsedResume?.parsedAt),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadResume = async (req, res) => {
  try {
    const candidate = req.candidate;
    const existingFilename = getResumeFilename(candidate);

    if (existingFilename) {
      await deleteResumeFile(req.file.filename);
      return res.status(409).json({
        success: false,
        message:
          "Resume already exists. Use PATCH /candidate/resume to replace it.",
      });
    }

    applyResumeToCandidate(candidate, req.file);
    await candidate.save();

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: formatResumeResponse(req, candidate),
    });
  } catch (error) {
    console.error(error);
    await deleteResumeFile(req.file?.filename);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const replaceResume = async (req, res) => {
  try {
    const candidate = req.candidate;
    const previousFilename = getResumeFilename(candidate);

    if (!previousFilename) {
      await deleteResumeFile(req.file.filename);
      return res.status(404).json({
        success: false,
        message:
          "No resume to replace. Use POST /candidate/resume to upload one.",
      });
    }

    applyResumeToCandidate(candidate, req.file);
    await candidate.save();
    await Candidate.updateOne(
      { _id: candidate._id },
      { $unset: { parsedResume: 1 } }
    );

    if (previousFilename !== req.file.filename) {
      await deleteResumeFile(previousFilename);
    }

    return res.json({
      success: true,
      message: "Resume replaced successfully",
      resume: formatResumeResponse(req, candidate),
    });
  } catch (error) {
    console.error(error);
    await deleteResumeFile(req.file?.filename);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    const candidate = req.candidate;
    const filename = getResumeFilename(candidate);

    if (!filename) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    await clearResumeFromCandidate(candidate);
    await deleteResumeFile(filename);

    return res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const parseResume = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.candidate._id);

    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const result = await parseCandidateResume(candidate);

    return res.json({
      success: true,
      message: "Resume analyzed successfully",
      parsedResume: result.parsedResume,
    });
  } catch (error) {
    const mapped = mapParseError(error);
    return res.status(mapped.statusCode).json(mapped.body);
  }
};

const getResumeAnalysis = async (req, res) => {
  try {
    const parsedResume = sanitizeParsedResumeForClient(
      req.candidate.parsedResume
    );

    if (!parsedResume) {
      return res.status(404).json({
        success: false,
        message: "No resume analysis found. Run Analyze Resume first.",
      });
    }

    return res.json({
      success: true,
      parsedResume,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getResume,
  uploadResume,
  replaceResume,
  deleteResume,
  parseResume,
  getResumeAnalysis,
};
