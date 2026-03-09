import { motion } from "framer-motion";
import { Shield, Clock, UserCheck, Zap, HeartHandshake, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const WhyChooseUsSection = () => {
  const { t } = useTranslation();
  const reasons = [
    { icon: UserCheck, title: t("whyUs.expertTutors"), desc: t("whyUs.expertTutorsDesc") },
    { icon: Zap, title: t("whyUs.personalized"), desc: t("whyUs.personalizedDesc") },
    { icon: Clock, title: t("whyUs.flexible"), desc: t("whyUs.flexibleDesc") },
    { icon: Shield, title: t("whyUs.proven"), desc: t("whyUs.provenDesc") },
    { icon: BarChart3, title: t("whyUs.progress"), desc: t("whyUs.progressDesc") },
    { icon: HeartHandshake, title: t("whyUs.dedicated"), desc: t("whyUs.dedicatedDesc") },
  ];

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="container mx-auto relative">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
          <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">{t("whyUs.label")}</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-5">
            {t("whyUs.title")} <span className="text-accent">{t("whyUs.titleHighlight")}</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("whyUs.subtitle")}</motion.p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i} className="group relative bg-card rounded-2xl p-8 border border-border hover:border-accent/30 premium-shadow-sm hover:premium-shadow transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                <Icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
