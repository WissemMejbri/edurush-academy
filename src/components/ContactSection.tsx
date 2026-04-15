import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Clock, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
};

const ContactSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", curriculum: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: t("contact.fillRequired"), variant: "destructive" });
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({ title: t("contact.sent"), description: t("contact.sentDesc") });
      setForm({ name: "", email: "", curriculum: "", message: "" });
    }, 1000);
  };

  return (
    <section id="contact" className="section-padding bg-background">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="text-center mb-12">
            <motion.span variants={fadeUp} custom={0} className="text-accent font-semibold text-sm uppercase tracking-widest">{t("contact.label")}</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-4">
              {t("contact.title")} <span className="text-accent">{t("contact.titleHighlight")}</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-xl mx-auto">{t("contact.subtitle")}</motion.p>
          </motion.div>
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-5">
              {[
                { icon: Mail, title: t("contact.emailUs"), desc: "info.edurushacademy@gmail.com", href: "mailto:info.edurushacademy@gmail.com?subject=Inquiry%20about%20EduRush%20Academy" },
                { icon: Clock, title: t("contact.responseTime"), desc: t("contact.responseTimeVal"), href: undefined },
                { icon: Phone, title: t("contact.callUs"), desc: "+216 48 044 486", href: "tel:+21648044486" },
              ].map(({ icon: Icon, title, desc, href }, i) => {
                const content = (
                  <>
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-accent" /></div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{title}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{desc}</p>
                    </div>
                  </>
                );
                return (
                  <motion.div key={title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                    {href ? (
                      <a href={href} className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm flex items-start gap-4 hover:border-accent/40 transition-colors cursor-pointer no-underline">
                        {content}
                      </a>
                    ) : (
                      <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm flex items-start gap-4">
                        {content}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <motion.form initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} onSubmit={handleSubmit} className="lg:col-span-3 bg-card rounded-2xl border border-border p-8 premium-shadow-sm">
              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("contact.fullName")} *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40" placeholder={t("contact.namePlaceholder")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("contact.email")} *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40" placeholder={t("contact.emailPlaceholder")} />
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground mb-2">{t("contact.curriculum")}</label>
                <select value={form.curriculum} onChange={(e) => setForm({ ...form, curriculum: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40">
                  <option value="">{t("contact.selectCurriculum")}</option>
                  <option value="igcse">{t("contact.igcse")}</option>
                  <option value="as-a-levels">{t("contact.alevels")}</option>
                  <option value="ib">{t("contact.ib")}</option>
                  <option value="other">{t("contact.other")}</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">{t("contact.message")} *</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={1000} rows={4} className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none" placeholder={t("contact.messagePlaceholder")} />
              </div>
              <button type="submit" disabled={sending} className="w-full bg-accent text-accent-foreground px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <Send className="w-4 h-4" />{sending ? t("contact.sending") : t("contact.send")}
              </button>
            </motion.form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
