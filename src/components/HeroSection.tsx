import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Award } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Students learning together" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/80" />
      </div>

      <div className="container mx-auto relative z-10 py-32 md:py-40">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-accent/30">
              Cambridge IGCSE · AS & A Levels · IB
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6">
              Accelerate Your{" "}
              <span className="text-accent">Academic Success</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl leading-relaxed">
              Expert online tutoring and personalized guidance for students pursuing
              internationally recognized curricula. Join learners worldwide and unlock your full potential.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#contact"
              className="bg-accent text-accent-foreground px-8 py-4 rounded-lg text-base font-semibold hover:opacity-90 transition-opacity text-center"
            >
              Book a Free Consultation
            </a>
            <a
              href="#programs"
              className="border-2 border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-lg text-base font-semibold hover:bg-primary-foreground/10 transition-colors text-center"
            >
              Explore Programs
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-lg"
          >
            {[
              { icon: GraduationCap, label: "IGCSE & A Levels", sub: "Full support" },
              { icon: BookOpen, label: "IB Programme", sub: "All subjects" },
              { icon: Award, label: "100% Online", sub: "Worldwide" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <Icon className="w-7 h-7 text-accent" />
                <span className="text-sm font-semibold text-primary-foreground">{label}</span>
                <span className="text-xs text-primary-foreground/60">{sub}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
