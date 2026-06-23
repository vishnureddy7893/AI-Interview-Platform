import { Menu, Bell, Search } from "lucide-react";

function DashboardNavbar({
  sidebarOpen,
  setSidebarOpen,
  candidate,
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-gray-200 bg-white">

      <div className="flex h-full items-center justify-between px-8">

        {/* Left */}

        <div className="flex items-center gap-5">

          <button
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            className="rounded-xl p-3 hover:bg-gray-100 transition"
          >
            <Menu size={22} />
          </button>

          <div>

            <h1 className="text-xl font-bold">

              Good Morning,
              {" "}
              <span className="text-green-600">
                {candidate?.name || "Candidate"}
              </span>
              👋

            </h1>

            <p className="text-sm text-gray-500">

              Let's build your dream career together.

            </p>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-5">

          {/* Search */}

          <div className="hidden lg:flex items-center gap-3 rounded-2xl border bg-gray-50 px-4 py-3 w-80">

            <Search
              size={18}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full bg-transparent outline-none text-sm"
            />

          </div>

          {/* Notification */}

          <button className="relative rounded-xl p-3 hover:bg-gray-100 transition">

            <Bell size={22} />

            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-green-500"></span>

          </button>

          {/* Avatar */}

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white">

              {(candidate?.name || candidate?.email || "C")
                .charAt(0)
                .toUpperCase()}

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}

export default DashboardNavbar;