import { motion } from "framer-motion";

const stats = [
  {
    value: "AI",
    title: "Resume Screening",
    description: "Smart skill extraction and resume analysis.",
  },
  {
    value: "24/7",
    title: "Interview Availability",
    description: "Candidates can practice interviews anytime.",
  },
  {
    value: "Live",
    title: "Coding Assessment",
    description: "Real-time coding environment with evaluation.",
  },
  {
    value: "100%",
    title: "Workflow Automation",
    description: "End-to-end recruitment process management.",
  },
];

function StatisticsSection() {
  return (
    <section className="bg-white py-24">

      <div className="max-w-7xl mx-auto px-6">

        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center text-5xl font-extrabold text-slate-900"
        >
          Built for Modern Hiring
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-6 text-center text-lg text-slate-600 max-w-3xl mx-auto"
        >
          Our platform combines AI, automation, coding assessments and
          intelligent workflows to simplify the recruitment process.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">

          {stats.map((item) => (

            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-5xl font-extrabold text-blue-600">
                {item.value}
              </h3>

              <h4 className="mt-6 text-xl font-bold text-slate-900">
                {item.title}
              </h4>

              <p className="mt-4 text-slate-600 leading-7">
                {item.description}
              </p>
            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default StatisticsSection;