import HeroSection from "./sections/HeroSection";
import DashboardGrid from "./sections/DashboardGrid";
import NextActionCard from "./cards/NextActionCard";
import ResumeStatusCard from "./cards/ResumeStatusCard";

function Home({ onNavigate, refreshKey = 0 }) {
  return (
    <div className="space-y-8">
      <HeroSection />

      <ResumeStatusCard onNavigate={onNavigate} key={`resume-${refreshKey}`} />

      <NextActionCard onNavigate={onNavigate} refreshKey={refreshKey} />

      <DashboardGrid />
    </div>
  );
}

export default Home;
