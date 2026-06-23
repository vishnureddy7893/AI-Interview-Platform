const steps = [
  {
    title: "Applied",
    completed: true,
  },
  {
    title: "Review",
    completed: true,
  },
  {
    title: "Assessment",
    completed: true,
  },
  {
    title: "Interview",
    completed: false,
  },
  {
    title: "Offer",
    completed: false,
  },
];

function Timeline() {
  return (
    <div className="flex justify-between items-center relative mt-8">

      {/* Line */}

      <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200 rounded-full"></div>

      <div
        className="absolute top-5 left-8 h-1 bg-green-500 rounded-full"
        style={{ width: "55%" }}
      ></div>

      {steps.map((step) => (
        <div
          key={step.title}
          className="relative z-10 flex flex-col items-center"
        >
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white ${
              step.completed
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          >
            ✓
          </div>

          <p className="mt-3 text-sm font-medium text-center">
            {step.title}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Timeline;