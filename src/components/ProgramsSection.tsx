import { motion } from "framer-motion";
import { BookOpen, FlaskConical, Star, ArrowRight, CheckCircle2 } from "lucide-react";

const programs = [
  {
    icon: BookOpen,
    title: "Cambridge IGCSE",
    description: "Comprehensive tutoring across all IGCSE subjects with a focus on exam technique, concept mastery, and coursework support.",
    features: ["Subject-specific tutoring", "Past paper practice", "Exam preparation workshops", "Coursework guidance"],
    color: "from-primary to-navy-light",
  },
  {
    icon: FlaskConical,
    title: "AS & A Levels",
    description: "Advanced-level preparation designed to help students achieve top grades and secure offers from leading universities worldwide.",
    features: ["In-depth subject coaching", "University application support", "Predicted grade strategy", "Mock exam preparation"],
    color: "from-accent/90 to-accent",
  },
  {
    icon: Star,
    title: "International Baccalaureate",
    description: "Full support for the IB Diploma Programme including core components — TOK, Extended Essay, and CAS guidance.",
    features: ["HL & SL subject support", "TOK & Extended Essay mentoring", "Internal assessment coaching", "CAS portfolio guidance"],
    color: "from-navy-dark to-primary",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6 },
  }),
};

const ProgramsSection = () => {
  return (
    <section id="programs" className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">
            Academic Programs
          </motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
            Curricula We <span className="text-accent">Support</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tailored academic programs designed to help students master their curriculum and achieve outstanding results.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {programs.map(({ icon: Icon, title, description, features, color }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i}
              className="bg-card rounded-2xl border border-border overflow-hidden premium-shadow-sm hover:premium-shadow transition-all duration-300 group flex flex-col"
            >
              <div className={`bg-gradient-to-r ${color} p-7`}>
                <Icon className="w-9 h-9 text-primary-foreground/90 mb-3" />
                <h3 className="font-display text-2xl font-bold text-primary-foreground">{title}</h3>
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
                <ul className="space-y-3 mb-6 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:gap-3 transition-all group/link"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
