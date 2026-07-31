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
const app = express();

const PORT = Number(process.env.PORT) || 5000;

// Connect MongoDB
connectDB();

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

// Generate Interview Question
app.post("/ask", async (req, res) => {
  try {
    const { category, difficulty } =
      req.body;

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
    console.error(error);

    res.status(500).json({
      error:
        "Failed to generate question",
    });
  }
});

// Evaluate Candidate Answer
app.post("/evaluate", async (req, res) => {
  try {
    const { question, answer } =
      req.body;

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
    console.error(error);

    res.status(500).json({
      error: "Evaluation failed",
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
