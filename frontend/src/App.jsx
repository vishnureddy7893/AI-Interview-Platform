import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import CandidateLogin from "./CandidateLogin";
import CandidateSignup from "./CandidateSignup";
import CandidateDashboard from "./CandidateDashboard";
import RecruiterLogin from "./RecruiterLogin";
import RecruiterSignup from "./RecruiterSignup";
import RecruiterDashboard from "./RecruiterDashboard";
import RecruiterCreateJob from "./components/recruiter/RecruiterCreateJob";
import CompanyLogin from "./CompanyLogin";
import CompanyDashboard from "./CompanyDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RecruiterAcceptInvitation from "./RecruiterAcceptInvitation";
import InterviewStart from "./components/candidate/InterviewStart";
import InterviewSession from "./components/candidate/InterviewSession";
import InterviewSummary from "./components/candidate/InterviewSummary";
import AssessmentRoundPage from "./components/candidate/AssessmentRoundPage";
import RecruiterInterviewReview from "./components/recruiter/RecruiterInterviewReview";
import { RecruiterApplicationDetail } from "./components/recruiter/RecruiterApplications";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/company/login" element={<CompanyLogin />} />
      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute allowedRoles={["CompanyAdmin"]}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/candidate/login" element={<CandidateLogin />} />
      <Route path="/candidate/signup" element={<CandidateSignup />} />
      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Candidate"]}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/interview/start/:jobId"
        element={
          <ProtectedRoute allowedRoles={["Candidate"]}>
            <InterviewStart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/interview/session/:interviewId"
        element={
          <ProtectedRoute allowedRoles={["Candidate"]}>
            <InterviewSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/interview/summary/:interviewId"
        element={
          <ProtectedRoute allowedRoles={["Candidate"]}>
            <InterviewSummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/assessment/:module/:applicationId/:roundId"
        element={
          <ProtectedRoute allowedRoles={["Candidate"]}>
            <AssessmentRoundPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/team/accept-invitation"
        element={<RecruiterAcceptInvitation />}
      />
      <Route path="/recruiter/login" element={<RecruiterLogin />} />
      <Route path="/recruiter/signup" element={<RecruiterSignup />} />
      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Recruiter"]}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/create"
        element={
          <ProtectedRoute allowedRoles={["Recruiter", "CompanyAdmin"]}>
            <RecruiterCreateJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/:jobId/edit"
        element={
          <ProtectedRoute allowedRoles={["Recruiter", "CompanyAdmin"]}>
            <RecruiterCreateJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/interviews/:interviewId"
        element={
          <ProtectedRoute allowedRoles={["Recruiter", "CompanyAdmin"]}>
            <RecruiterInterviewReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/applications/:applicationId"
        element={
          <ProtectedRoute allowedRoles={["Recruiter", "CompanyAdmin"]}>
            <RecruiterApplicationDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
