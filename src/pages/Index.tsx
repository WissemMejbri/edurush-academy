import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProgramsSection from "@/components/ProgramsSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";

import TestimonialsSection from "@/components/TestimonialsSection";
import SkillsSection from "@/components/SkillsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ContactSection from "@/components/ContactSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import AIChatbot from "@/components/AIChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ProgramsSection />
      <WhyChooseUsSection />
      <TutorProfilesSection />
      <TestimonialsSection />
      <SkillsSection />
      <HowItWorksSection />
      <ContactSection />
      <CTASection />
      <Footer />
      <CookieConsent />
      <AIChatbot />
    </div>
  );
};

export default Index;
