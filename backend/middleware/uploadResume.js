const fs = require("fs");
const path = require("path");
const multer = require("multer");

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

const getUploadsDir = () =>
  path.join(__dirname, "..", "uploads");

const ensureUploadsDir = () => {
  const uploadsDir = getUploadsDir();

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  return uploadsDir;
};

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, ensureUploadsDir());
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadResume = multer({
  storage,
  limits: {
    fileSize: MAX_RESUME_SIZE_BYTES,
  },
  fileFilter: function (_req, file, cb) {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExt =
      path.extname(file.originalname).toLowerCase() === ".pdf";

    if (isPdfMime && isPdfExt) {
      cb(null, true);
      return;
    }

    cb(new Error("Only PDF files are allowed"));
  },
});

const handleResumeUpload = (req, res, next) => {
  uploadResume.single("resume")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size must be 5 MB or less",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid resume file",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF is required",
      });
    }

    next();
  });
};

module.exports = {
  MAX_RESUME_SIZE_BYTES,
  getUploadsDir,
  ensureUploadsDir,
  handleResumeUpload,
};
