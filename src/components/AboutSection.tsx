import { motion } from "framer-motion";
import { Target, Eye, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
};

const AboutSection = () => {
  const { t } = useTranslation();
  const cards = [
    { icon: Target, title: t("about.mission"), desc: t("about.missionDesc") },
    { icon: Eye, title: t("about.vision"), desc: t("about.visionDesc") },
    { icon: Globe, title: t("about.global"), desc: t("about.globalDesc") },
  ];

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="max-w-3xl mx-auto text-center mb-16">
          <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">{t("about.label")}</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
            {t("about.title")} <span className="text-accent">{t("about.titleHighlight")}</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg leading-relaxed">{t("about.description")}</motion.p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i} className="bg-card rounded-2xl p-8 border border-border premium-shadow-sm hover:premium-shadow hover:border-accent/20 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                <Icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
