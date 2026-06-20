import NextActionCard from "./cards/NextActionCard";
import TimelineCard from "./cards/TimelineCard";
function Home() {
  const candidate = JSON.parse(
    localStorage.getItem("candidate")
  );

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-bold">

          Good Morning,
          {" "}
          {candidate?.name || "Candidate"} 👋

        </h1>

        <p className="text-gray-500 mt-2 text-lg">

          Let's build your dream career together.

        </p>

      </div>

      <NextActionCard />
      <div className="grid lg:grid-cols-3 gap-6">

    <div className="lg:col-span-2">

        <TimelineCard />

    </div>

</div>

    </div>
  );
}

export default Home;