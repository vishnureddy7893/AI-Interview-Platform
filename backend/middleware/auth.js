const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

const protectCandidate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const candidate = await Candidate.findById(decoded.id).select(
      "-password"
    );

    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.candidate = candidate;
    next();
  } catch (error) {
    const statusCode =
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
        ? 401
        : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 401
          ? "Invalid or expired token"
          : error.message,
    });
  }
};

module.exports = {
  getTokenFromRequest,
  protectCandidate,
};
