import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import CandidateLogin from "./CandidateLogin";
import CandidateSignup from "./CandidateSignup";
import CandidateDashboard from "./CandidateDashboard";

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

    </Routes>
  );
}

export default App;