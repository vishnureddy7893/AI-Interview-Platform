import Navbar from "./components/home/Navbar";
import HeroSection from "./components/home/HeroSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HowItWorksSection from "./components/home/HowItWorksSection";
import AudienceSection from "./components/home/AudienceSection";
import PortalSection from "./components/home/PortalSection";
import FinalCtaSection from "./components/home/FinalCtaSection";
import SiteFooter from "./components/home/SiteFooter";

/**
 * Marketing landing page.
 *
 * Order follows the question a visitor actually asks: what is this → what does
 * it do → how does it work → is it for me → where do I sign in → do it.
 */
function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AudienceSection />
        <PortalSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}

export default Home;
