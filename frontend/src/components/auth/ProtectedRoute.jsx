import { Navigate } from "react-router-dom";

const loginMap = {
  CompanyAdmin: "/company/login",
  Recruiter: "/recruiter/login",
  Candidate: "/candidate/login",
};

const dashboardMap = {
  CompanyAdmin: "/company/dashboard",
  Recruiter: "/recruiter/dashboard",
  Candidate: "/candidate/dashboard",
};

function ProtectedRoute({ children, allowedRoles }) {
  let auth = null;

  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      auth = JSON.parse(stored);
    }
  } catch {
    // localStorage empty or malformed — redirect to login
  }

  if (!auth || !auth.token) {
    const firstRole = allowedRoles?.[0] || "Candidate";
    return <Navigate to={loginMap[firstRole]} replace />;
  }

  if (!allowedRoles?.includes(auth.role)) {
    const destination = dashboardMap[auth.role] || "/";
    return <Navigate to={destination} replace />;
  }

  return children;
}

export default ProtectedRoute;