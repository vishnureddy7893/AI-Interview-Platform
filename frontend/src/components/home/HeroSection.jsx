import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50 to-white">

      {/* Background Blur */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-28">

        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-6xl md:text-7xl font-extrabold text-slate-900 leading-tight"
        >
          AI Hiring Platform
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 max-w-4xl mx-auto text-center text-xl text-slate-600 leading-9"
        >
          One intelligent platform for AI-powered recruitment,
          resume screening, coding assessments, technical interviews
          and hiring workflows.
        </motion.p>

        <motion.div
  initial={{ opacity: 0, y: 25 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6 }}
  className="flex flex-col md:flex-row justify-center gap-6 mt-14"
>
  <button
    onClick={() => navigate("/candidate/login")}
    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-700"
  >
    Candidate Login
    <ArrowRight size={20} />
  </button>

  <button
    onClick={() => navigate("/company/login")}
    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-emerald-700"
  >
    Company Login
    <ArrowRight size={20} />
  </button>

  <button
    onClick={() => navigate("/recruiter/login")}
    className="flex items-center justify-center gap-2 rounded-xl border-2 border-purple-600 px-8 py-4 text-lg font-semibold text-purple-600 transition-all duration-300 hover:scale-105 hover:bg-purple-600 hover:text-white"
  >
    Recruiter Login
    <ArrowRight size={20} />
  </button>
</motion.div>

      </div>
    </section>
  );
}

export default HeroSection;