import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RecruiterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const loginRecruiter = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/recruiter/login",
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
        // Save JWT Token
        localStorage.setItem(
          "recruiterToken",
          data.token
        );

        // Save Recruiter ID
        localStorage.setItem(
          "recruiterId",
          data.recruiter._id
        );

        // Save Recruiter Info
        localStorage.setItem(
          "recruiterName",
          data.recruiter.recruiterName
        );

        localStorage.setItem(
          "companyName",
          data.recruiter.companyName
        );

        navigate("/recruiter/dashboard");
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
      }}
    >
      <h2>Recruiter Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
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
      />

      <br />
      <br />

      <button onClick={loginRecruiter}>
        Login
      </button>

      <br />
      <br />

      <button
        onClick={() =>
          navigate("/recruiter/signup")
        }
      >
        Create Account
      </button>
    </div>
  );
}

export default RecruiterLogin;