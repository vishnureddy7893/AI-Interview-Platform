import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResumeUpload() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resume, setResume] = useState(null);

  const uploadResume = async () => {
    if (!resume) {
      alert("Please select a PDF file");
      return;
    }

    const formData = new FormData();

    formData.append("email", email);
    formData.append("resume", resume);

    try {
      const response = await fetch(
        "http://localhost:5000/candidate/upload-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Resume Uploaded Successfully");
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Upload Failed");
    }
  };

  return (
    <div
      style={{
        width: "500px",
        margin: "50px auto",
      }}
    >
      <h1>Upload Resume</h1>

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
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setResume(
            e.target.files[0]
          )
        }
      />

      <br />
      <br />

      <button
        onClick={uploadResume}
      >
        Upload Resume
      </button>
    </div>
  );
}

export default ResumeUpload;