import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CandidateLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const loginCandidate = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/candidate/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "email",
          data.candidate.email
        );

        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Login Failed");
    }
  };

  return (
    <div
      style={{
        width: "350px",
        margin: "100px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        textAlign: "center",
      }}
    >
      <h1>AI Hiring Platform</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        style={{
          width: "90%",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        style={{
          width: "90%",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <button
        onClick={loginCandidate}
        style={{
          width: "95%",
          padding: "10px",
        }}
      >
        Sign In
      </button>

      <br />
      <br />

      <p>Don't have an account?</p>

      <button
        onClick={() =>
          navigate("/signup")
        }
      >
        Sign Up
      </button>
    </div>
  );
}

export default CandidateLogin;