import { motion } from "framer-motion";
import { Target, Eye, Globe } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6 },
  }),
};

const AboutSection = () => {
  return (
    <section id="about" className="section-padding bg-background">
      <div className="container mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">
            About Us
          </motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6">
            Empowering Students to{" "}
            <span className="text-accent">Thrive Globally</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg leading-relaxed">
            Based in Tunis and operating fully online, EduRush Academy is dedicated to developing
            confident thinkers, innovators, and future leaders. We provide world-class academic
            support for students pursuing internationally recognized curricula.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Our Mission",
              desc: "To make high-quality academic support accessible to every student, regardless of location, empowering them to excel in globally recognized curricula.",
            },
            {
              icon: Eye,
              title: "Our Vision",
              desc: "To be the leading online academy for international education, nurturing the next generation of global thinkers and leaders.",
            },
            {
              icon: Globe,
              title: "Global Reach",
              desc: "From Tunis to the world — our fully online platform connects expert tutors with students across continents, ensuring personalized guidance wherever they are.",
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i}
              className="bg-card rounded-2xl p-8 border border-border premium-shadow-sm hover:premium-shadow hover:border-accent/20 transition-all duration-300 group"
            >
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
