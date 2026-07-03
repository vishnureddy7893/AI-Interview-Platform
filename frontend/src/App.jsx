import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import CandidateLogin from "./CandidateLogin";
import CandidateSignup from "./CandidateSignup";
import CandidateDashboard from "./CandidateDashboard";
import RecruiterLogin from "./RecruiterLogin";
import RecruiterSignup from "./RecruiterSignup";
import RecruiterDashboard from "./RecruiterDashboard";
import CompanyLogin from "./CompanyLogin";
import CompanyDashboard from "./CompanyDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RecruiterAcceptInvitation from "./RecruiterAcceptInvitation";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      {/* Company Routes */}
     

      <Route
        path="/company/login"
        element={<CompanyLogin />}
      />

      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute allowedRoles={["CompanyAdmin"]}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
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
        element={
          <ProtectedRoute allowedRoles={["Candidate"]}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />

      {/* Recruiter Routes */}
      <Route
  path="/team/accept-invitation"
  element={<RecruiterAcceptInvitation />}
/>
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
        element={
          <ProtectedRoute allowedRoles={["Recruiter"]}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;