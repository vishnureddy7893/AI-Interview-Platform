import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import CandidateLogin from "./CandidateLogin";
import CandidateSignup from "./CandidateSignup";
import CandidateDashboard from "./CandidateDashboard";
import RecruiterLogin from "./RecruiterLogin";
import RecruiterSignup from "./RecruiterSignup";
import RecruiterDashboard from "./RecruiterDashboard";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

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

    </Routes>
  );
}

export default App;