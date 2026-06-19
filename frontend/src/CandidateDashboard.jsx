import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard() {
  const navigate = useNavigate();

  const [completion, setCompletion] =
    useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const email =
        localStorage.getItem("email");

      const response = await fetch(
        `http://localhost:5000/candidate/profile/${email}`
      );

      const data =
        await response.json();

      if (data.success) {
        const candidate =
          data.candidate;

        let percentage = 0;

        // Personal Details
        if (candidate.name)
          percentage += 20;

        // Academic Details
        if (candidate.college)
          percentage += 20;

        // Projects
        if (
          candidate.projects &&
          candidate.projects.length > 0
        )
          percentage += 20;

        // Certifications
        if (
          candidate.certifications &&
          candidate.certifications
            .length > 0
        )
          percentage += 20;

        // Resume
        if (candidate.resumeUrl)
          percentage += 20;

        setCompletion(
          percentage
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    localStorage.removeItem(
      "token"
    );
    localStorage.removeItem(
      "email"
    );

    navigate("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
          backgroundColor: "white",
          borderRadius: "15px",
          padding: "30px",
          boxShadow:
            "0px 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#1e3a8a",
          }}
        >
          AI Hiring Platform
        </h1>

        <h2>Candidate Dashboard</h2>

        <br />

        <h3>Profile Completion</h3>

        <div
          style={{
            width: "100%",
            height: "25px",
            backgroundColor: "#e5e7eb",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${completion}%`,
              height: "100%",
              backgroundColor:
                "#2563eb",
            }}
          ></div>
        </div>

        <p
          style={{
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          {completion}% Completed
        </p>

        <hr />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: "20px",
          }}
        >
          <div
            style={{
              border:
                "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>
              👤 Personal Details
            </h3>

            <button
              onClick={() =>
                navigate(
                  "/personal-details"
                )
              }
            >
              Edit Personal
              Details
            </button>
          </div>

          <div
            style={{
              border:
                "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>
              🎓 Academic Details
            </h3>

            <button
              onClick={() =>
                navigate(
                  "/academic-details"
                )
              }
            >
              Academic Details
            </button>
          </div>

          <div
            style={{
              border:
                "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>💻 Projects</h3>

            <button
              onClick={() =>
                navigate(
                  "/projects"
                )
              }
            >
              Add Project
            </button>
          </div>

          <div
            style={{
              border:
                "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>
              📜 Certifications
            </h3>

            <button
              onClick={() =>
                navigate(
                  "/certifications"
                )
              }
            >
              Add Certification
            </button>
          </div>

          <div
            style={{
              border:
                "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>
              📄 Resume Upload
            </h3>

            <button
              onClick={() =>
                navigate(
                  "/resume-upload"
                )
              }
            >
              Upload Resume
            </button>
          </div>
        </div>

        <br />

        <button
          onClick={logout}
          style={{
            backgroundColor:
              "red",
            color: "white",
            border: "none",
            padding:
              "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;