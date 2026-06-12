require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const askGroq = require("./groq");
const connectDB = require("./config/db");
const candidateRoutes = require("./routes/candidateRoutes");

const app = express();

// Connect MongoDB
connectDB();

app.use(cors());
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
app.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  );
});