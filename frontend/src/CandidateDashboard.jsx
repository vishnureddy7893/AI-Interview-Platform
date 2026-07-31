import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import DashboardNavbar from "./components/layout/DashboardNavbar";
import Sidebar from "./components/layout/Sidebar";
import BottomNav from "./components/layout/BottomNav";

import Home from "./components/dashboard/Home";
import Jobs from "./components/dashboard/Jobs";
import Search from "./components/dashboard/Search";
import ResumeManagement from "./components/candidate/ResumeManagement";
import Applications from "./components/candidate/Applications";

function getAuthCandidate() {
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    if (auth?.role === "Candidate" && auth.user) {
      return auth.user;
    }
  } catch {
    // ignore
  }

  try {
    return JSON.parse(localStorage.getItem("candidate") || "null");
  } catch {
    return null;
  }
}

function CandidateDashboard() {
  const location = useLocation();
  const candidate = useMemo(() => getAuthCandidate(), []);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState(
    () => location.state?.activePage || "home"
  );
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);

  const handleResumeChange = useCallback(() => {
    setHomeRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (location.state?.activePage) {
      setActivePage(location.state.activePage);
    }
  }, [location.state]);

  useEffect(() => {
    const onNavigate = (event) => {
      if (event.detail) setActivePage(event.detail);
    };
    window.addEventListener("candidate-navigate", onNavigate);
    return () => window.removeEventListener("candidate-navigate", onNavigate);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "jobs":
        return <Jobs />;

      case "applications":
        return <Applications />;

      case "search":
        return <Search />;

      case "resume":
        return <ResumeManagement onResumeChange={handleResumeChange} />;

      default:
        return (
          <Home
            onNavigate={setActivePage}
            refreshKey={homeRefreshKey}
          />
        );
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <DashboardNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        candidate={candidate}
      />

      <div className="flex h-full pb-16 pt-16">
        <Sidebar
          sidebarOpen={sidebarOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>

      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}

export default CandidateDashboard;
