import { motion } from "framer-motion";
import {
  FileText,
  BrainCircuit,
  Code2,
  BarChart3,
} from "lucide-react";

function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      color: "text-blue-600",
      title: "AI Resume Parsing",
      description:
        "Automatically extract skills, education, projects and experience from resumes using AI.",
    },
    {
      icon: BrainCircuit,
      color: "text-purple-600",
      title: "AI Interview Engine",
      description:
        "Conduct intelligent interviews with adaptive questions and real-time evaluation.",
    },
    {
      icon: Code2,
      color: "text-green-600",
      title: "Coding Assessments",
      description:
        "Evaluate coding skills using an integrated online compiler with automatic scoring.",
    },
    {
      icon: BarChart3,
      color: "text-orange-500",
      title: "Hiring Analytics",
      description:
        "Get detailed insights into candidate performance and recruitment efficiency.",
    },
  ];

  return (
    <section className="py-24 bg-white">

      <div className="max-w-7xl mx-auto px-6">

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-5xl font-extrabold text-slate-900"
        >
          Everything You Need
        </motion.h2>

        <p className="text-center text-lg text-slate-600 mt-5 max-w-3xl mx-auto">
          A complete AI-powered recruitment ecosystem for
          candidates and recruiters.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                }}
                viewport={{ once: true }}
                className="bg-slate-50 rounded-3xl border border-slate-200 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-white shadow flex items-center justify-center ${feature.color}`}
                >
                  <Icon size={34} />
                </div>

                <h3 className="text-2xl font-bold mt-8">
                  {feature.title}
                </h3>

                <p className="mt-5 text-slate-600 leading-7">
                  {feature.description}
                </p>

              </motion.div>
            );
          })}

        </div>

      </div>

    </section>
  );
}

export default FeaturesSection;