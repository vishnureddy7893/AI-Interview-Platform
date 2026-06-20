import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Certifications() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      email: "",
      certification: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const saveCertification =
    async () => {
      try {
        const response =
          await fetch(
            "http://localhost:5000/candidate/certifications",
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
            "Certification Added Successfully"
          );

          navigate("/dashboard");
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert("Failed");
      }
    };

  return (
    <div
      style={{
        width: "500px",
        margin: "50px auto",
      }}
    >
      <h1>Add Certification</h1>

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
        name="certification"
        placeholder="Certification Name"
        onChange={handleChange}
      />

      <br />
      <br />

      <button
        onClick={
          saveCertification
        }
      >
        Save Certification
      </button>
    </div>
  );
}

export default Certifications;