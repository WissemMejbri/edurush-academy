import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6 },
  }),
};

const ContactSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", curriculum: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setForm({ name: "", email: "", curriculum: "", message: "" });
    }, 1000);
  };

  return (
    <section id="contact" className="section-padding bg-secondary/50">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">
              Get In Touch
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Book a Free <span className="text-accent">Consultation</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-xl mx-auto">
              Ready to start your journey? Fill out the form below and our team will get in touch within 24 hours.
            </motion.p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl border border-border p-8 md:p-10 shadow-sm"
          >
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Curriculum</label>
              <select
                value={form.curriculum}
                onChange={(e) => setForm({ ...form, curriculum: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
              >
                <option value="">Select a curriculum</option>
                <option value="igcse">Cambridge IGCSE</option>
                <option value="as-a-levels">AS & A Levels</option>
                <option value="ib">International Baccalaureate (IB)</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow resize-none"
                placeholder="Tell us about your goals and how we can help..."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full sm:w-auto bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
