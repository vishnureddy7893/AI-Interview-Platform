function HeroSection() {
  const candidate = JSON.parse(localStorage.getItem("candidate"));

  const currentHour = new Date().getHours();

  let greeting = "Good Evening";

  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 17) {
    greeting = "Good Afternoon";
  }

  return (
    <div className="flex items-center justify-between">

      <div>

        <h1 className="text-4xl font-bold text-zinc-900">

          {greeting},{" "}
          <span className="text-green-600">
            {candidate?.name || "Candidate"}
          </span>
          👋

        </h1>

        <p className="mt-3 text-lg text-gray-500">

          Let's build your dream career together.

        </p>

      </div>

    </div>
  );
}

export default HeroSection;