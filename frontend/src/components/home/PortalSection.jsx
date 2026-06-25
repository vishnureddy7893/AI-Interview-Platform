import { motion } from "framer-motion";
import {
  GraduationCap,
  Building2,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function PortalSection() {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Candidate Portal",
      description:
        "Kick-start your career with AI-powered interview preparation and job applications.",
      icon: GraduationCap,
      color: "text-blue-600",
      actions: [
  {
    label: "Login",
    route: "/candidate/login",
    color: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    label: "Register",
    route: "/candidate/signup",
    color:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
  },
],
      features: [
        "Apply for Jobs",
        "AI Mock Interviews",
        "Coding Assessments",
        "Resume Analysis",
      ],
    },

    {
  title: "Company Portal",
  description:
    "Register your company, manage recruiters, create jobs and hire top talent using AI.",
  icon: Building2,
  color: "text-emerald-600",
  actions: [
  {
    label: "Login",
    route: "/company/login",
    color: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    label: "Register",
    route: "/company/signup",
    color:
      "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white",
  },
],
  features: [
    "Company Registration",
    "Manage Recruiters",
    "Create Jobs",
    "AI Hiring Dashboard",
  ],
},
{
  title: "Recruiter Portal",
  description:
    "Login to manage assigned jobs, evaluate candidates and track the hiring process.",
  icon: Users,
  color: "text-purple-600",
  actions: [
  {
    label: "Login",
    route: "/recruiter/login",
    color: "bg-purple-600 hover:bg-purple-700 text-white",
  },
],
  features: [
    "Assigned Jobs",
    "Candidate Shortlisting",
    "Interview Scheduling",
    "Hiring Pipeline",
  ],
},
  ];

  return (
    <section className="py-24 bg-slate-50">

      <div className="max-w-7xl mx-auto px-6">

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          viewport={{ once: true }}
          className="text-5xl font-extrabold text-center text-slate-900"
        >
          Choose Your Journey
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
          }}
          transition={{
            delay: 0.2,
          }}
          viewport={{ once: true }}
          className="text-center text-slate-600 text-lg mt-6 max-w-3xl mx-auto"
        >
          Whether you're preparing for your dream
          job or hiring exceptional talent,
          AI Interview Platform is built for you.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-10 mt-16">

          {portals.map((portal, index) => {
            const Icon = portal.icon;

            return (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-10"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center ${portal.color}`}
                >
                  <Icon size={34} />
                </div>

                <h3 className="text-3xl font-bold mt-8 text-slate-900">
                  {portal.title}
                </h3>

                <p className="mt-4 text-slate-600 leading-7">
                  {portal.description}
                </p>

                <div className="mt-8 space-y-4">

                  {portal.features.map(
                    (feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle2
                          size={20}
                          className="text-green-500"
                        />

                        <span className="text-slate-700">
                          {feature}
                        </span>
                      </div>
                    )
                  )}

                </div>

                <div className="mt-10 flex gap-3">
  {portal.actions.map((action, index) => (
    <button
      key={index}
      onClick={() => navigate(action.route)}
      className={`flex-1 rounded-xl py-4 font-semibold transition-all duration-300 hover:scale-105 ${action.color}`}
    >
      {action.label}
    </button>
  ))}
</div>

              </motion.div>
            );
          })}

        </div>

      </div>

    </section>
  );
}

export default PortalSection;