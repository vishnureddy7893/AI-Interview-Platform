import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateWorkflow() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] =
    useState("");

  const [role, setRole] =
    useState("");

  const [round1, setRound1] =
    useState("");

  const [round2, setRound2] =
    useState("");

  const [round3, setRound3] =
    useState("");

  const [round4, setRound4] =
    useState("");

  const roundOptions = [
    "Verbal",
    "Reasoning",
    "Aptitude",
    "Coding",
    "Technical",
    "HR",
  ];

  const createWorkflow = async () => {
    try {
      const recruiterId =
        localStorage.getItem(
          "recruiterId"
        );

      const response = await fetch(
        "http://localhost:5000/workflow/create",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            companyName,
            role,

            rounds: [
              { name: round1 },
              { name: round2 },
              { name: round3 },
              { name: round4 },
            ],

            recruiterId,
          }),
        }
      );

      const data =
        await response.json();

      if (data.success) {
        alert(
          "Workflow Created Successfully"
        );

        navigate(
          "/recruiter/dashboard"
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
        maxWidth: "700px",
        margin: "50px auto",
        padding: "30px",
      }}
    >
      <h2>Create Hiring Workflow</h2>

      <br />

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
        placeholder="Role"
        value={role}
        onChange={(e) =>
          setRole(e.target.value)
        }
      />

      <br />
      <br />

      <select
        onChange={(e) =>
          setRound1(e.target.value)
        }
      >
        <option>
          Select Round 1
        </option>

        {roundOptions.map((round) => (
          <option key={round}>
            {round}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        onChange={(e) =>
          setRound2(e.target.value)
        }
      >
        <option>
          Select Round 2
        </option>

        {roundOptions.map((round) => (
          <option key={round}>
            {round}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        onChange={(e) =>
          setRound3(e.target.value)
        }
      >
        <option>
          Select Round 3
        </option>

        {roundOptions.map((round) => (
          <option key={round}>
            {round}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        onChange={(e) =>
          setRound4(e.target.value)
        }
      >
        <option>
          Select Round 4
        </option>

        {roundOptions.map((round) => (
          <option key={round}>
            {round}
          </option>
        ))}
      </select>

      <br />
      <br />

      <button
        onClick={createWorkflow}
      >
        Create Workflow
      </button>
    </div>
  );
}

export default CreateWorkflow;