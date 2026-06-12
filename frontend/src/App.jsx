import { BrowserRouter, Routes, Route } from "react-router-dom";

import CandidateLogin from "./CandidateLogin";
import CandidateSignup from "./CandidateSignup";
import Dashboard from "./Dashboard";
import PersonalDetails from "./PersonalDetails";
import AcademicDetails from "./AcademicDetails";
import Projects from "./Projects";
import Certifications from "./Certifications";
import ResumeUpload from "./ResumeUpload";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<CandidateLogin />}
        />

        <Route
          path="/signup"
          element={<CandidateSignup />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/personal-details"
          element={<PersonalDetails />}
        />

        <Route
          path="/academic-details"
          element={<AcademicDetails />}
        />

        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/certifications"
          element={<Certifications />}
        />

        <Route
          path="/resume-upload"
          element={<ResumeUpload />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;