import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <h1
          className="text-2xl font-extrabold text-blue-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          AI Interview Platform
        </h1>

        <div className="hidden md:flex items-center gap-8">

          <button className="text-slate-600 hover:text-blue-600">
            Home
          </button>

          <button
            onClick={() => navigate("/candidate/login")}
            className="text-slate-600 hover:text-blue-600"
          >
            Candidate
          </button>

          <button
            onClick={() => navigate("/recruiter/login")}
            className="text-slate-600 hover:text-blue-600"
          >
            Recruiter
          </button>

          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>

        </div>

        <button className="md:hidden">
          <Menu size={28} />
        </button>

      </div>

    </nav>
  );
}

export default Navbar;