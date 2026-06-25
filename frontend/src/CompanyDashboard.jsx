import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import DashboardNavbar from "./components/layout/DashboardNavbar";
import Sidebar from "./components/layout/Sidebar";
import BottomNav from "./components/layout/BottomNav";

function CompanyDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      if (!auth || !auth.token || auth.role !== "CompanyAdmin") {
        navigate("/company/login");
      }
    } catch {
      navigate("/company/login");
    }
  }, [navigate]);

  const auth = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth"));
    } catch {
      return null;
    }
  })();

  if (!auth || auth.role !== "CompanyAdmin") return null;

  return (
    <div className="h-screen bg-slate-100 overflow-hidden">
      <DashboardNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        candidate={auth.user}
      />
      <div className="flex pt-16 pb-16 h-full">
        <Sidebar
          sidebarOpen={sidebarOpen}
          activePage="home"
          setActivePage={() => {}}
          role="companyadmin"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-lg">Company Dashboard</p>
          </div>
        </main>
      </div>
      <BottomNav
        activePage="home"
        setActivePage={() => {}}
      />
    </div>
  );
}

export default CompanyDashboard;