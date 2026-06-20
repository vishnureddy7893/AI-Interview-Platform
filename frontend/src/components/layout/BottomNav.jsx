import { House, BriefcaseBusiness, Search } from "lucide-react";

function BottomNav({ activePage, setActivePage }) {
  const navItems = [
    {
      name: "Home",
      icon: House,
      page: "home",
    },
    {
      name: "Jobs",
      icon: BriefcaseBusiness,
      page: "jobs",
    },
    {
      name: "Search",
      icon: Search,
      page: "search",
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-lg z-50">

      <div className="flex justify-around items-center h-full">

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.page}
              onClick={() => setActivePage(item.page)}
              className={`flex flex-col items-center justify-center transition ${
                activePage === item.page
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              <Icon size={22} />

              <span className="text-xs mt-1">
                {item.name}
              </span>
            </button>
          );
        })}

      </div>

    </footer>
  );
}

export default BottomNav;