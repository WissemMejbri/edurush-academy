import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

const testimonials = [
  { name: "Amira K.", role: "IB Diploma Student", country: "Tunisia", text: "EduRush transformed my approach to studying. I went from a 5 to a 7 in IB Mathematics in just one semester. The tutors truly care about your success.", rating: 5, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
  { name: "David L.", role: "Parent of IGCSE Student", country: "UK", text: "As a parent, I appreciate the detailed progress reports and the genuine dedication of the tutors. My son's grades improved remarkably in just months.", rating: 5, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
  { name: "Fatima H.", role: "A Level Student", country: "Qatar", text: "The personalized study plans and exam preparation sessions were exactly what I needed. I secured my A* grades and got accepted to my dream university!", rating: 5, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
};

const TestimonialsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      <div className="container mx-auto relative">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
          <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">{t("testimonials.label")}</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-5">
            {t("testimonials.title")} <span className="text-accent">{t("testimonials.titleHighlight")}</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("testimonials.subtitle")}</motion.p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map(({ name, role, country, text, rating, image }, i) => (
            <motion.div key={name} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i} className="relative bg-card rounded-2xl border border-border p-8 premium-shadow-sm hover:premium-shadow transition-all duration-300">
              <Quote className="w-10 h-10 text-accent/20 absolute top-6 right-6" />
              <div className="flex gap-1 mb-5">
                {Array.from({ length: rating }).map((_, j) => (<Star key={j} className="w-4 h-4 text-accent fill-accent" />))}
              </div>
              <p className="text-foreground/80 leading-relaxed mb-6 text-sm italic">"{text}"</p>
              <div className="flex items-center gap-3">
                <img src={image} alt={name} className="w-11 h-11 rounded-full object-cover ring-2 ring-accent/20" loading="lazy" />
                <div>
                  <p className="font-semibold text-foreground text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{role} · {country}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
