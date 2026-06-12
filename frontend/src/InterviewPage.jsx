import { useState } from "react";

function App() {
  const [category, setCategory] = useState("Java");
  const [difficulty, setDifficulty] = useState("Easy");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");

  const getQuestion = async () => {
    const response = await fetch(
      "http://localhost:5000/ask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          difficulty,
        }),
      }
    );

    const data = await response.json();

    setQuestion(data.answer);
    setEvaluation("");
  };

  const evaluateAnswer = async () => {
    const response = await fetch(
      "http://localhost:5000/evaluate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer,
        }),
      }
    );

    const data = await response.json();

    setEvaluation(data.evaluation);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>AI Interview Platform</h1>

      <h3>Select Category</h3>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option>Java</option>
        <option>C</option>
        <option>Python</option>
        <option>DBMS</option>
        <option>Operating Systems</option>
        <option>Computer Networks</option>
        <option>System Design</option>
      </select>

      <h3>Select Difficulty</h3>

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <br />
      <br />

      <button onClick={getQuestion}>
        Generate Interview Question
      </button>

      <hr />

      <h2>Question</h2>

      <div
        style={{
          border: "1px solid gray",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        {question}
      </div>

      <h2>Your Answer</h2>

      <textarea
        rows="10"
        cols="80"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your answer here..."
      />

      <br />
      <br />

      <button onClick={evaluateAnswer}>
        Submit Answer
      </button>

      <hr />

      <h2>AI Evaluation</h2>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f4f4f4",
          padding: "15px",
        }}
      >
        {evaluation}
      </pre>
    </div>
  );
}

export default App;