import { useNavigate } from "react-router-dom";

function RecruiterDashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("recruiterToken");
    localStorage.removeItem("recruiterId");
    localStorage.removeItem("recruiterName");
    localStorage.removeItem("companyName");

    navigate("/recruiter/login");
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
          maxWidth: "1100px",
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
            color: "#1e3a8a",
          }}
        >
          Recruiter Dashboard
        </h1>

        <p>
          Welcome{" "}
          {localStorage.getItem(
            "recruiterName"
          ) || "Recruiter"}
        </p>

        <hr />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr 1fr",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>Jobs Posted</h3>
            <h2>0</h2>
          </div>

          <div
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>Applications</h3>
            <h2>0</h2>
          </div>

          <div
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>Workflows</h3>
            <h2>0</h2>
          </div>
        </div>

        <br />

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Hiring Management</h3>

          <p>
            Create jobs and workflows
          </p>

          <button
            onClick={() =>
              navigate("/create-job")
            }
            style={{
              backgroundColor:
                "#16a34a",
              color: "white",
              border: "none",
              padding:
                "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Hire
          </button>

          <button
            onClick={() =>
              navigate(
                "/create-workflow"
              )
            }
            style={{
              backgroundColor:
                "#2563eb",
              color: "white",
              border: "none",
              padding:
                "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Create Workflow
          </button>
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

export default RecruiterDashboard;