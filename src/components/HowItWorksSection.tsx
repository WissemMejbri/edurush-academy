import { motion } from "framer-motion";
import { ClipboardCheck, Route, Video, TrendingUp } from "lucide-react";

const steps = [
  { icon: ClipboardCheck, step: "01", title: "Assessment", desc: "We evaluate your current level, goals, and curriculum requirements through an initial consultation." },
  { icon: Route, step: "02", title: "Personalized Plan", desc: "A tailored study plan is crafted based on your strengths, weaknesses, and exam timeline." },
  { icon: Video, step: "03", title: "Online Sessions", desc: "Engage in interactive one-on-one or small group sessions with expert tutors." },
  { icon: TrendingUp, step: "04", title: "Progress Tracking", desc: "Regular reports and feedback ensure continuous improvement and goal achievement." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6 },
  }),
};

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding bg-primary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container mx-auto relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">
            Our Process
          </motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mt-3 mb-4">
            How It <span className="text-accent">Works</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            A simple, structured approach to help you reach your academic goals.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ icon: Icon, step, title, desc }, i) => (
            <motion.div
              key={step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i}
              className="text-center group"
            >
              <div className="relative mx-auto mb-6">
                <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-8 h-8 text-accent" />
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-full w-full h-px bg-gradient-to-r from-accent/30 to-transparent -translate-y-1/2" />
                )}
              </div>
              <span className="text-accent font-bold text-sm">{step}</span>
              <h3 className="font-display text-xl font-bold text-primary-foreground mt-1 mb-3">{title}</h3>
              <p className="text-primary-foreground/60 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
