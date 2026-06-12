import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AcademicDetails() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      college: "",
      branch: "",
      cgpa: "",
      passoutYear: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const saveAcademicDetails =
    async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/candidate/academic-details",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              formData
            ),
          }
        );

        const data =
          await response.json();

        if (data.success) {
          alert(
            "Academic Details Saved Successfully"
          );

          navigate("/dashboard");
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert("Failed to Save");
      }
    };

  return (
    <div
      style={{
        width: "500px",
        margin: "50px auto",
      }}
    >
      <h1>Academic Details</h1>

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <br />
      <br />

      <input
        type="text"
        name="college"
        placeholder="College"
        onChange={handleChange}
      />

      <br />
      <br />

      <input
        type="text"
        name="branch"
        placeholder="Branch"
        onChange={handleChange}
      />

      <br />
      <br />

      <input
        type="number"
        name="cgpa"
        placeholder="CGPA"
        onChange={handleChange}
      />

      <br />
      <br />

      <input
        type="number"
        name="passoutYear"
        placeholder="Passout Year"
        onChange={handleChange}
      />

      <br />
      <br />

      <button
        onClick={
          saveAcademicDetails
        }
      >
        Save Academic Details
      </button>
    </div>
  );
}

export default AcademicDetails;