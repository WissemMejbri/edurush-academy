import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-navy-dark" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>
      <div className="container mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 text-sm font-semibold text-accent mb-8">
            <Sparkles className="w-4 h-4" />{t("cta.badge")}
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            {t("cta.title1")}<br /><span className="text-accent">{t("cta.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-primary-foreground/70 mb-10 max-w-xl mx-auto leading-relaxed">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="bg-accent text-accent-foreground px-8 py-4 rounded-xl text-base font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all inline-flex items-center justify-center gap-2 group">
              {t("cta.cta1")}<ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </a>
            <a href="#programs" className="glass text-primary-foreground px-8 py-4 rounded-xl text-base font-semibold hover:bg-primary-foreground/10 transition-all text-center">{t("cta.cta2")}</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
