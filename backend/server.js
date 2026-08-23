require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const askGroq = require("./groq");
const connectDB = require("./config/db");
const candidateRoutes = require("./routes/candidateRoutes");
const recruiterRoutes = require(
  "./routes/recruiterRoutes"
);
const dashboardRoutes = require("./routes/dashboardRoutes");
const workflowRoutes = require(
  "./routes/workflowRoutes"
);
const jobRoutes = require(
  "./routes/jobRoutes"
);
const interviewRoutes = require(
  "./routes/interviewRoutes"
);
const companyRoutes = require(
  "./routes/companyRoutes"
);
const teamRoutes = require(
  "./routes/teamRoutes"
);
const {
  recoverPendingJobs,
} = require("./services/resumeAnalysisQueue");

const app = express();

const PORT = Number(process.env.PORT) || 5000;

// Connect MongoDB, then pick up any background analysis jobs that were
// interrupted by a restart or crash.
connectDB().then(() => {
  recoverPendingJobs();
});

// CORS: restrict to FRONTEND_URL when set; otherwise allow all (previous default)
const corsOptions = process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL }
  : undefined;

app.use(cors(corsOptions));
app.use(express.json());

// Serve Uploaded Files
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// Candidate Routes
app.use("/candidate", candidateRoutes);
app.use("/recruiter", recruiterRoutes);
app.use("/workflow", workflowRoutes);
app.use("/job", jobRoutes);
app.use("/interview", interviewRoutes);
app.use("/application", require("./routes/applicationRoutes"));
app.use("/assessment", require("./routes/assessmentRoutes"));
app.use("/company", companyRoutes);
app.use("/team", teamRoutes);
app.use("/dashboard", dashboardRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message:
      "AI Hiring Platform Backend Running",
  });
});

const ALLOWED_DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);

// Generate Interview Question
// NOTE: this endpoint is unauthenticated and calls a paid AI provider.
// See FINAL REPORT — recommended to put behind `protectCandidate`.
app.post("/ask", async (req, res) => {
  try {
    const { category, difficulty } =
      req.body;

    if (!category || typeof category !== "string" || category.length > 100) {
      return res.status(400).json({
        error: "A valid category is required",
      });
    }

    if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
      return res.status(400).json({
        error: "difficulty must be Easy, Medium or Hard",
      });
    }

    const prompt = `
You are a senior technical interviewer.

Generate ONE ${difficulty} level interview question for ${category}.

Requirements:
- Ask only one question.
- Do not provide the answer.
- Keep it suitable for technical interviews.
`;

    const response =
      await askGroq(prompt);

    res.json({
      answer: response,
    });
  } catch (error) {
    console.error("[/ask]", error.code || "ERROR", error.message);
    if (error.help) console.error(`[/ask] ${error.help}`);

    res.status(error.statusCode || 500).json({
      error: "Couldn't generate a question right now. Please try again.",
      code: error.code || "AI_FAILURE",
    });
  }
});

// Evaluate Candidate Answer
app.post("/evaluate", async (req, res) => {
  try {
    const { question, answer } =
      req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "question is required" });
    }

    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({ error: "answer is required" });
    }

    const prompt = `
You are a Senior Software Engineer conducting a technical interview.

Question:
${question}

Candidate Answer:
${answer}

Evaluate the candidate.

Return:

Correctness Score (0-10)

Communication Score (0-10)

Technical Understanding (0-10)

Feedback

Follow-up Question
`;

    const response =
      await askGroq(prompt);

    res.json({
      evaluation: response,
    });
  } catch (error) {
    console.error("[/evaluate]", error.code || "ERROR", error.message);
    if (error.help) console.error(`[/evaluate] ${error.help}`);

    res.status(error.statusCode || 500).json({
      error: "Couldn't evaluate the answer right now. Please try again.",
      code: error.code || "AI_FAILURE",
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
