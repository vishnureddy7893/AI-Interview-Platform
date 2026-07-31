const fs = require("fs/promises");
const pdf = require("pdf-parse");
const aiService = require("./aiService");
const {
  getResumeFilename,
  resolveSafeUploadPath,
} = require("../utils/resumeStorage");

function isBlank(value) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Apply AI fields only where the candidate profile is empty.
 * Never overwrites manually entered data.
 */
function applyParsedResumeToProfile(candidate, result) {
  const data = result.data || {};
  const personal = data.personal || {};
  const education = Array.isArray(data.education) ? data.education[0] : null;
  const flatSkills = result.flatSkills || [];

  if (isBlank(candidate.name) && personal.name) {
    candidate.name = String(personal.name).trim();
  }

  if (isBlank(candidate.city) && personal.location) {
    const location = String(personal.location).trim();
    const [city] = location.split(",").map((part) => part.trim());
    if (city) candidate.city = city;
  }

  if (education) {
    if (isBlank(candidate.college) && education.university) {
      candidate.college = String(education.university).trim();
    }
    if (isBlank(candidate.branch) && education.degree) {
      candidate.branch = String(education.degree).trim();
    }
    if (isBlank(candidate.cgpa) && education.cgpa) {
      const cgpa = Number.parseFloat(String(education.cgpa));
      if (!Number.isNaN(cgpa)) candidate.cgpa = cgpa;
    }
    if (isBlank(candidate.passoutYear) && education.year) {
      const year = Number.parseInt(
        String(education.year).replace(/\D/g, ""),
        10
      );
      if (!Number.isNaN(year)) candidate.passoutYear = year;
    }
  }

  if (isBlank(candidate.skills) && flatSkills.length) {
    candidate.skills = [...flatSkills];
  }

  if (isBlank(candidate.projects) && data.projects?.length) {
    candidate.projects = data.projects
      .map((project) => {
        if (!project?.title && !project?.description) return null;
        const tech = Array.isArray(project.technologies)
          ? project.technologies.filter(Boolean).join(", ")
          : "";
        return [project.title, project.description, tech]
          .filter(Boolean)
          .join(" — ");
      })
      .filter(Boolean);
  }

  if (isBlank(candidate.certifications) && data.certifications?.length) {
    candidate.certifications = data.certifications
      .map((item) =>
        typeof item === "string"
          ? item.trim()
          : item?.name
            ? String(item.name).trim()
            : ""
      )
      .filter(Boolean);
  }
}

async function extractTextFromResumeFile(candidate) {
  const filename = getResumeFilename(candidate);

  if (!filename) {
    const error = new Error("Resume not found");
    error.code = "MISSING_RESUME";
    error.statusCode = 400;
    throw error;
  }

  const resumePath = resolveSafeUploadPath(filename);

  if (!resumePath) {
    const error = new Error("Resume not found");
    error.code = "INVALID_RESUME_PATH";
    error.statusCode = 400;
    throw error;
  }

  let dataBuffer;
  try {
    dataBuffer = await fs.readFile(resumePath);
  } catch (error) {
    const err = new Error("Failed to read PDF");
    err.code = "RESUME_READ_ERROR";
    err.statusCode = 400;
    err.cause = error;
    throw err;
  }

  let pdfData;
  try {
    pdfData = await pdf(dataBuffer);
  } catch (error) {
    const err = new Error("Failed to read PDF");
    err.code = "CORRUPT_PDF";
    err.statusCode = 400;
    err.cause = error;
    throw err;
  }

  const text = (pdfData.text || "").trim();
  if (!text) {
    const err = new Error("Failed to read PDF");
    err.code = "EMPTY_RESUME_TEXT";
    err.statusCode = 422;
    throw err;
  }

  return text;
}

/**
 * Full parse pipeline: PDF → Groq → save parsedResume → fill empty profile fields.
 */
async function parseCandidateResume(candidate) {
  const resumeText = await extractTextFromResumeFile(candidate);
  const result = await aiService.parseResume(resumeText);

  candidate.parsedResume = {
    ...result.data,
    parsedAt: new Date(),
    aiVersion: result.aiVersion,
    rawResponse: result.rawResponse,
  };

  applyParsedResumeToProfile(candidate, result);

  try {
    await candidate.save();
  } catch (error) {
    console.error("[resume/parse] database save failed", error);
    const err = new Error("Failed to save analysis");
    err.code = "SAVE_ANALYSIS_FAILED";
    err.statusCode = 500;
    err.cause = error;
    throw err;
  }

  return {
    parsedResume: sanitizeParsedResumeForClient(candidate.parsedResume),
    profileUpdated: true,
  };
}

function sanitizeParsedResumeForClient(parsedResume) {
  if (!parsedResume) return null;

  const doc =
    typeof parsedResume.toObject === "function"
      ? parsedResume.toObject()
      : { ...parsedResume };

  // Keep rawResponse out of default client payloads (still stored in DB)
  const { rawResponse, ...safe } = doc;
  return safe;
}

module.exports = {
  parseCandidateResume,
  extractTextFromResumeFile,
  applyParsedResumeToProfile,
  sanitizeParsedResumeForClient,
};
