import {
  House,
  User,
  Briefcase,
  FileText,
  Brain,
  Code2,
  History,
  Award,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar({ sidebarOpen, activePage, setActivePage }) {
  const menuItems = [
    { name: "Home", icon: House, page: "home" },
    { name: "Complete Profile", icon: User, page: "profile" },
    { name: "Applications", icon: Briefcase, page: "applications" },
    { name: "Resume", icon: FileText, page: "resume" },
    { name: "Mock Interview", icon: Brain, page: "interview" },
    { name: "Coding Practice", icon: Code2, page: "coding" },
    { name: "Interview History", icon: History, page: "history" },
    { name: "Certificates", icon: Award, page: "certificates" },
    { name: "Settings", icon: Settings, page: "settings" },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="py-6 flex flex-col justify-between h-full">
        <div>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.page}
                onClick={() => setActivePage(item.page)}
                className={`w-full flex items-center gap-4 px-6 py-3 hover:bg-blue-50 transition ${
                  activePage === item.page
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                <Icon size={22} />

                {sidebarOpen && (
                  <span>{item.name}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-6">
          <button
            className="w-full flex items-center gap-4 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={22} />

            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;