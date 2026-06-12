import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CandidateSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const registerCandidate = async () => {
    try {
      if (
        formData.password !==
        formData.confirmPassword
      ) {
        alert("Passwords do not match");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/candidate/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }),
        }
      );

      const data =
        await response.json();

      if (data.success) {
        alert(
          "Account Created Successfully"
        );

        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Registration Failed");
    }
  };

  return (
    <div
      style={{
        width: "350px",
        margin: "80px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        textAlign: "center",
      }}
    >
      <h1>Create Account</h1>

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        style={{
          width: "90%",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <input
        type="text"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        style={{
          width: "90%",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        style={{
          width: "90%",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        style={{
          width: "90%",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <button
        onClick={registerCandidate}
        style={{
          width: "95%",
          padding: "10px",
        }}
      >
        Create Account
      </button>

      <br />
      <br />

      <p>
        Already have an account?
      </p>

      <button
        onClick={() =>
          navigate("/")
        }
      >
        Sign In
      </button>
    </div>
  );
}

export default CandidateSignup;