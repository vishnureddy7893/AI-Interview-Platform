import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Home
import Home from "./Home";

// Candidate
import CandidateLogin from "./CandidateLogin";
import CandidateSignup from "./CandidateSignup";
import CandidateDashboard from "./CandidateDashboard";
import CandidatePersonalDetails from "./CandidatePersonalDetails";
import CandidateAcademicDetails from "./CandidateAcademicDetails";
import CandidateProjects from "./CandidateProjects";
import CandidateCertifications from "./CandidateCertifications";
import CandidateResumeUpload from "./CandidateResumeUpload";

// Recruiter
import RecruiterLogin from "./RecruiterLogin";
import RecruiterSignup from "./RecruiterSignup";
import RecruiterDashboard from "./RecruiterDashboard";
import RecruiterCreateWorkflow from "./RecruiterCreateWorkflow";
import RecruiterCreateJob from "./RecruiterCreateJob";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Candidate Routes */}
        <Route
          path="/candidate/login"
          element={<CandidateLogin />}
        />

        <Route
          path="/candidate/signup"
          element={<CandidateSignup />}
        />

        <Route
          path="/candidate/dashboard"
          element={<CandidateDashboard />}
        />

        <Route
          path="/candidate/personal-details"
          element={<CandidatePersonalDetails />}
        />

        <Route
          path="/candidate/academic-details"
          element={<CandidateAcademicDetails />}
        />

        <Route
          path="/candidate/projects"
          element={<CandidateProjects />}
        />

        <Route
          path="/candidate/certifications"
          element={<CandidateCertifications />}
        />

        <Route
          path="/candidate/resume-upload"
          element={<CandidateResumeUpload />}
        />

        {/* Recruiter Routes */}
        <Route
          path="/recruiter/login"
          element={<RecruiterLogin />}
        />

        <Route
          path="/recruiter/signup"
          element={<RecruiterSignup />}
        />

        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />

        <Route
          path="/recruiter/create-job"
          element={<RecruiterCreateJob />}
        />

        <Route
          path="/recruiter/create-workflow"
          element={<RecruiterCreateWorkflow />}
        />

        <Route
          path="/recruiter/view-jobs"
          element={
            <h2
              style={{
                textAlign: "center",
                marginTop: "100px",
              }}
            >
              View Jobs Page
            </h2>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;