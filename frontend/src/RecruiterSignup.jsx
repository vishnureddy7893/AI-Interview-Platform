import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RecruiterSignup() {
  const [companyName, setCompanyName] =
    useState("");

  const [recruiterName, setRecruiterName] =
    useState("");

  const [designation, setDesignation] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const navigate = useNavigate();

  const registerRecruiter = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/recruiter/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            companyName,
            recruiterName,
            designation,
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (data.success) {
        alert(
          "Recruiter Registered Successfully"
        );

        navigate(
          "/recruiter/login"
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        width: "400px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2>Recruiter Signup</h2>

      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={(e) =>
          setCompanyName(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Recruiter Name"
        value={recruiterName}
        onChange={(e) =>
          setRecruiterName(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Designation"
        value={designation}
        onChange={(e) =>
          setDesignation(
            e.target.value
          )
        }
      />

      <br />
      <br />

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
          setPassword(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <button
        onClick={registerRecruiter}
      >
        Register
      </button>

      <br />
      <br />

      <button
        onClick={() =>
          navigate(
            "/recruiter/login"
          )
        }
      >
        Already Have Account?
      </button>
    </div>
  );
}

export default RecruiterSignup;