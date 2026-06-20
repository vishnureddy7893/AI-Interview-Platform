import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateJob() {
  const navigate = useNavigate();

  const [roleName, setRoleName] =
    useState("");

  const [openings, setOpenings] =
    useState("");

  const [packageLPA, setPackageLPA] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [
    applicationDeadline,
    setApplicationDeadline,
  ] = useState("");

  const [workflowId, setWorkflowId] =
    useState("");

  const [workflows, setWorkflows] =
    useState([]);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows =
    async () => {
      try {
        const response =
          await fetch(
            "http://localhost:5000/workflow/all"
          );

        const data =
          await response.json();

        if (data.success) {
          setWorkflows(
            data.workflows
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

  const createJob = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/job/create",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            roleName,
            openings,
            packageLPA,
            location,
            experience,
            applicationDeadline,
            workflowId,
            createdBy:
              localStorage.getItem(
                "recruiterId"
              ),
          }),
        }
      );

      const data =
        await response.json();

      if (data.success) {
        alert(
          "Job Published Successfully"
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
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2>Hire</h2>

      <br />

      <input
        type="text"
        placeholder="Role Name"
        value={roleName}
        onChange={(e) =>
          setRoleName(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Number of Vacancies"
        value={openings}
        onChange={(e) =>
          setOpenings(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Package (LPA)"
        value={packageLPA}
        onChange={(e) =>
          setPackageLPA(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) =>
          setLocation(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Experience"
        value={experience}
        onChange={(e) =>
          setExperience(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="date"
        value={applicationDeadline}
        onChange={(e) =>
          setApplicationDeadline(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <select
        value={workflowId}
        onChange={(e) =>
          setWorkflowId(
            e.target.value
          )
        }
      >
        <option value="">
          Select Workflow
        </option>

        {workflows.map(
          (workflow) => (
            <option
              key={workflow._id}
              value={
                workflow._id
              }
            >
              {workflow.role ||
                "Workflow"}
            </option>
          )
        )}
      </select>

      <br />
      <br />

      <button
        onClick={() =>
          navigate(
            "/create-workflow"
          )
        }
      >
        Create New Workflow
      </button>

      <br />
      <br />

      <button
        onClick={createJob}
      >
        Publish Job
      </button>
    </div>
  );
}

export default CreateJob;