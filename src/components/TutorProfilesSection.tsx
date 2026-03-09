import { motion } from "framer-motion";
import { Star, Globe, BookOpen } from "lucide-react";

const tutors = [
  {
    name: "Dr. Sarah Mitchell",
    subject: "Mathematics & Physics",
    experience: "12 years",
    rating: 4.9,
    languages: ["English", "French"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Prof. Ahmed Benali",
    subject: "Chemistry & Biology",
    experience: "10 years",
    rating: 4.8,
    languages: ["English", "Arabic", "French"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Ms. Emily Chen",
    subject: "English Literature & TOK",
    experience: "8 years",
    rating: 4.9,
    languages: ["English", "Mandarin"],
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Mr. James Okafor",
    subject: "Economics & Business",
    experience: "9 years",
    rating: 4.7,
    languages: ["English", "French"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6 },
  }),
};

const TutorProfilesSection = () => {
  return (
    <section className="section-padding bg-secondary/40">
      <div className="container mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">
            Our Tutors
          </motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-5">
            Meet Our <span className="text-accent">Expert Educators</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Passionate, qualified tutors dedicated to helping students achieve academic excellence.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tutors.map(({ name, subject, experience, rating, languages, image }, i) => (
            <motion.div
              key={name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i}
              className="group bg-card rounded-2xl border border-border overflow-hidden premium-shadow-sm hover:premium-shadow transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={image}
                  alt={name}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                  <span className="text-xs font-bold text-foreground">{rating}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-foreground mb-1">{name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-accent font-medium mb-3">
                  <BookOpen className="w-3.5 h-3.5" />
                  {subject}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <Globe className="w-3 h-3" />
                  {languages.join(" · ")} · {experience}
                </div>
                <a
                  href="#contact"
                  className="w-full inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Book Session
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TutorProfilesSection;
