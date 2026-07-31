import { LogOut } from "lucide-react";
import navigation from "@/config/navigation";

function Sidebar({ sidebarOpen, activePage, setActivePage, role = "candidate" }) {
  const config = navigation[role] || navigation.candidate;
  const { logoutKey, logoutPath, items } = config;

  const handleLogout = () => {
    localStorage.removeItem(logoutKey);
    localStorage.removeItem("auth");
    window.location.href = logoutPath;
  };

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 shadow-sm ${
        sidebarOpen ? "w-60" : "w-20"
      }`}
    >
      <div className="flex h-full flex-col justify-between py-6">

        {/* Menu */}

        <div className="space-y-2 px-3">

          {items.map((item) => {
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
            onClick={handleLogout}
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