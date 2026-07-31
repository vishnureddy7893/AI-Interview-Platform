const fs = require("fs/promises");
const path = require("path");
const Candidate = require("../models/Candidate");
const { getUploadsDir } = require("../middleware/uploadResume");

const getResumeFilename = (candidate) =>
  candidate?.resume?.filename || candidate?.resumeUrl || null;

/**
 * Allow only a plain basename inside uploads/ (no traversal, no absolute paths).
 */
const sanitizeResumeFilename = (filename) => {
  if (!filename || typeof filename !== "string") {
    return null;
  }

  const trimmed = filename.trim();
  if (!trimmed) {
    return null;
  }

  const base = path.basename(trimmed);

  if (base !== trimmed) {
    return null;
  }

  if (base === "." || base === ".." || base.includes("..")) {
    return null;
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(base)) {
    return null;
  }

  return base;
};

const resolveSafeUploadPath = (filename) => {
  const safeName = sanitizeResumeFilename(filename);

  if (!safeName) {
    return null;
  }

  const uploadsDir = path.resolve(getUploadsDir());
  const resolved = path.resolve(uploadsDir, safeName);
  const relative = path.relative(uploadsDir, resolved);

  if (
    !relative ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    return null;
  }

  return resolved;
};

const buildPublicResumeUrl = (req, filename) => {
  const safeName = sanitizeResumeFilename(filename);
  if (!safeName) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${safeName}`;
};

const buildResumeMetadata = (file) => ({
  filename: file.filename,
  originalName: file.originalname,
  size: file.size,
  url: `/uploads/${file.filename}`,
  uploadedAt: new Date(),
});

const applyResumeToCandidate = (candidate, file) => {
  const metadata = buildResumeMetadata(file);
  candidate.resume = metadata;
  // Keep legacy field in sync for parse-resume / older clients
  candidate.resumeUrl = file.filename;
  return metadata;
};

/**
 * Fully remove nested resume + legacy resumeUrl from MongoDB.
 */
const clearResumeFromCandidate = async (candidate) => {
  await Candidate.updateOne(
    { _id: candidate._id },
    { $unset: { resume: 1, resumeUrl: 1, parsedResume: 1 } }
  );

  candidate.resume = undefined;
  candidate.resumeUrl = undefined;
  candidate.parsedResume = undefined;
};

/**
 * Async delete; never throws. Logs cleanup failures.
 */
const deleteResumeFile = async (filename) => {
  if (!filename) return;

  const filePath = resolveSafeUploadPath(filename);

  if (!filePath) {
    console.warn(
      "[resume] Skipped file delete — unsafe or invalid filename:",
      filename
    );
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }

    console.error(
      "[resume] Failed to delete file after DB update:",
      filename,
      error.message
    );
  }
};

const formatResumeResponse = (req, candidate) => {
  const filename = getResumeFilename(candidate);

  if (!filename || !sanitizeResumeFilename(filename)) {
    return null;
  }

  const resume = candidate.resume || {};
  const publicUrl = buildPublicResumeUrl(req, filename);

  return {
    filename: resume.filename || filename,
    originalName: resume.originalName || filename,
    size: resume.size || null,
    uploadedAt: resume.uploadedAt || candidate.updatedAt || null,
    url: resume.url || `/uploads/${filename}`,
    downloadUrl: publicUrl,
    previewUrl: publicUrl,
  };
};

module.exports = {
  getResumeFilename,
  sanitizeResumeFilename,
  resolveSafeUploadPath,
  buildPublicResumeUrl,
  buildResumeMetadata,
  applyResumeToCandidate,
  clearResumeFromCandidate,
  deleteResumeFile,
  formatResumeResponse,
};
