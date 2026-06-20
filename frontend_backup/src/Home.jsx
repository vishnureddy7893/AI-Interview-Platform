import Navbar from "./components/home/Navbar";
import HeroSection from "./components/home/HeroSection";
import PortalSection from "./components/home/PortalSection";
import FeaturesSection from "./components/home/FeaturesSection";
import StatisticsSection from "./components/home/StatisticsSection";

function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <PortalSection />
      <FeaturesSection />
      <StatisticsSection />
    </>
  );
}
export default Home;