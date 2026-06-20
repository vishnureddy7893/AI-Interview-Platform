import { useState } from "react";

import DashboardNavbar from "./components/layout/DashboardNavbar";
import Sidebar from "./components/layout/Sidebar";
import BottomNav from "./components/layout/BottomNav";

import Home from "./components/dashboard/Home";
import Jobs from "./components/dashboard/Jobs";
import Search from "./components/dashboard/Search";

function CandidateDashboard() {
  const candidate = JSON.parse(localStorage.getItem("candidate"));

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("home");

  const renderPage = () => {
    switch (activePage) {
      case "jobs":
        return <Jobs />;

      case "search":
        return <Search />;

      default:
        return <Home />;
    }
  };

  return (
    <div className="h-screen bg-slate-100 overflow-hidden">

      <DashboardNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        candidate={candidate}
      />

      <div className="flex pt-16 pb-16 h-full">

        <Sidebar
          sidebarOpen={sidebarOpen}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>

      </div>

      <BottomNav
        activePage={activePage}
        setActivePage={setActivePage}
      />

    </div>
  );
}

export default CandidateDashboard;