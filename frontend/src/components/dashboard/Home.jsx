import HeroSection from "./sections/HeroSection";
import DashboardGrid from "./sections/DashboardGrid";
import NextActionCard from "./cards/NextActionCard";

function Home() {
  return (
    <div className="space-y-8">

      <HeroSection />

      <NextActionCard />

      <DashboardGrid />

    </div>
  );
}

export default Home;