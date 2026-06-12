import { useState } from "react";

function PersonalDetails() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    gender: "",
    dob: "",
    city: "",
    state: "",
    linkedin: "",
    github: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveDetails = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/candidate/personal-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Personal Details Saved Successfully");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to Save Details");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Personal Details</h1>

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="gender"
        placeholder="Gender"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="date"
        name="dob"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="city"
        placeholder="City"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="state"
        placeholder="State"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="linkedin"
        placeholder="LinkedIn URL"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="github"
        placeholder="GitHub URL"
        onChange={handleChange}
      />

      <br /><br />

      <button onClick={saveDetails}>
        Save Details
      </button>
    </div>
  );
}

export default PersonalDetails;