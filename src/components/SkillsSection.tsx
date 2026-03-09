import { motion } from "framer-motion";
import { MessageSquare, Brain, Users, Monitor, Wrench, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const SkillsSection = () => {
  const { t } = useTranslation();
  const skills = [
    { icon: MessageSquare, title: t("skills.communication"), desc: t("skills.communicationDesc") },
    { icon: Brain, title: t("skills.criticalThinking"), desc: t("skills.criticalThinkingDesc") },
    { icon: Users, title: t("skills.leadership"), desc: t("skills.leadershipDesc") },
    { icon: Monitor, title: t("skills.digitalLiteracy"), desc: t("skills.digitalLiteracyDesc") },
    { icon: Wrench, title: t("skills.productivity"), desc: t("skills.productivityDesc") },
    { icon: ShieldCheck, title: t("skills.techFundamentals"), desc: t("skills.techFundamentalsDesc") },
  ];

  return (
    <section id="skills" className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
          <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">{t("skills.label")}</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            {t("skills.title")} <span className="text-accent">{t("skills.titleHighlight")}</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("skills.subtitle")}</motion.p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i} className="group p-7 rounded-2xl border border-border bg-card hover:border-accent/20 premium-shadow-sm hover:premium-shadow transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 group-hover:scale-110 transition-all duration-300">
                <Icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
