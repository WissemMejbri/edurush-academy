import { motion } from "framer-motion";
import { MessageSquare, Brain, Users, Monitor, Wrench, ShieldCheck } from "lucide-react";

const skills = [
  { icon: MessageSquare, title: "Communication", desc: "Build confidence in public speaking, writing, and interpersonal skills." },
  { icon: Brain, title: "Critical Thinking", desc: "Develop analytical reasoning and problem-solving approaches." },
  { icon: Users, title: "Leadership", desc: "Cultivate leadership qualities through collaborative projects and mentoring." },
  { icon: Monitor, title: "Digital Literacy", desc: "Master essential digital tools for academic and professional success." },
  { icon: Wrench, title: "Productivity Tools", desc: "Learn efficient workflows with modern productivity software." },
  { icon: ShieldCheck, title: "Tech Fundamentals", desc: "Gain foundational technology skills for the modern digital world." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const SkillsSection = () => {
  return (
    <section id="skills" className="section-padding bg-background">
      <div className="container mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">
            Beyond Academics
          </motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Skills & <span className="text-accent">Professional Development</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We equip students with the soft skills and digital competencies needed to thrive in an interconnected world.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i}
              className="group p-6 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
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
