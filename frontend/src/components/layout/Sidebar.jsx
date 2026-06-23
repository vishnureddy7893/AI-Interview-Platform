import {
  House,
  User,
  Briefcase,
  ClipboardList,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

function Sidebar({ sidebarOpen, activePage, setActivePage }) {
  const menuItems = [
    {
      name: "Dashboard",
      icon: House,
      page: "home",
    },
    {
      name: "Complete Profile",
      icon: User,
      page: "profile",
    },
    {
      name: "Applied Jobs",
      icon: Briefcase,
      page: "applications",
    },
    {
      name: "Assessments",
      icon: ClipboardList,
      page: "assessments",
    },
    {
      name: "Interviews",
      icon: CalendarDays,
      page: "interviews",
    },
    {
      name: "Reports",
      icon: BarChart3,
      page: "reports",
    },
    {
      name: "Notifications",
      icon: Bell,
      page: "notifications",
    },
    {
      name: "Settings",
      icon: Settings,
      page: "settings",
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 shadow-sm ${
        sidebarOpen ? "w-60" : "w-20"
      }`}
    >
      <div className="flex h-full flex-col justify-between py-6">

        {/* Menu */}

        <div className="space-y-2 px-3">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.page}
                onClick={() => setActivePage(item.page)}
                className={`w-full flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${
                  activePage === item.page
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={22} />

                {sidebarOpen && (
                  <span className="text-sm">
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}

        </div>

        {/* Logout */}

        <div className="px-3">

          <button
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-gray-600 hover:bg-gray-100 transition-all"
          >
            <LogOut size={22} />

            {sidebarOpen && (
              <span className="text-sm">
                Logout
              </span>
            )}

          </button>

        </div>

      </div>
    </aside>
  );
}

export default Sidebar;