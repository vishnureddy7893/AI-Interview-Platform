import { Menu, Bell } from "lucide-react";

function DashboardNavbar({
  sidebarOpen,
  setSidebarOpen,
  candidate,
}) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50">

      <div className="h-full flex items-center justify-between px-6">

        {/* Left Side */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-xl font-bold text-blue-600">
            AI Interview Platform
          </h1>

        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5">

          <button className="relative p-2 rounded-full hover:bg-gray-100 transition">

            <Bell size={22} />

            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>

          </button>

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">

              {(candidate?.name || candidate?.email || "C")
                .charAt(0)
                .toUpperCase()}

            </div>

            <div className="hidden md:block">

              <p className="font-semibold text-gray-800">
                {candidate?.name || "Candidate"}
              </p>

              <p className="text-sm text-gray-500">
                Candidate
              </p>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}

export default DashboardNavbar;