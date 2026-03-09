import { motion } from "framer-motion";
import { GraduationCap, Award, ArrowRight, Users, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import heroBg from "@/assets/hero-bg.jpg";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="Students learning together" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-navy-dark/95" />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 left-1/6 w-56 h-56 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>
      <div className="container mx-auto relative z-10 py-32 md:py-40">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 text-sm font-semibold text-accent mb-8">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                {t("hero.badge")}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-primary-foreground leading-[1.1] mb-8">
                {t("hero.title1")}{" "}
                <span className="text-accent">{t("hero.titleHighlight")}</span>{" "}
                {t("hero.title2")}
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/75 mb-10 max-w-xl leading-relaxed">
                {t("hero.subtitle")}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="bg-accent text-accent-foreground px-8 py-4 rounded-xl text-base font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all text-center inline-flex items-center justify-center gap-2 group">
                {t("hero.cta1")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </a>
              <a href="#programs" className="glass text-primary-foreground px-8 py-4 rounded-xl text-base font-semibold hover:bg-primary-foreground/10 transition-all text-center">
                {t("hero.cta2")}
              </a>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="hidden lg:grid grid-cols-2 gap-5">
            {[
              { icon: Users, value: 260, suffix: "+", label: t("hero.students"), color: "text-accent" },
              { icon: GraduationCap, value: 25, suffix: "+", label: t("hero.tutors"), color: "text-gold-light" },
              { icon: Award, value: 98, suffix: "%", label: t("hero.satisfaction"), color: "text-gold-light" },
            ].map(({ icon: Icon, value, suffix, label, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }} className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform">
                <Icon className={`w-8 h-8 ${color} mb-3`} />
                <div className="text-3xl font-bold text-primary-foreground mb-1">
                  <AnimatedCounter target={value} suffix={suffix} />
                </div>
                <p className="text-sm text-primary-foreground/60">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.6 }} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 lg:hidden">
          {[
            { icon: Users, label: "500+ " + t("hero.students").split(" ")[0] },
            { icon: GraduationCap, label: "25+ " + t("hero.tutors").split(" ")[0] },
            { icon: Globe, label: "15+ " + t("hero.countries").split(" ")[0] },
            { icon: Award, label: "98% " + t("hero.satisfaction").split(" ")[0] },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <Icon className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="text-xs font-semibold text-primary-foreground">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
