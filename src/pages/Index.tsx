import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background particle-bg">
      <HeroSection />
      <FeaturesGrid />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
