import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.programs"), href: "#programs" },
    { label: t("nav.tutors"), href: "#tutors" },
    { label: t("nav.howItWorks"), href: "#how-it-works" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-card/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20">
        <a href="#home" className="flex items-center gap-2">
          <span className="font-display text-xl md:text-2xl font-bold text-primary">
            Edu<span className="text-accent">Rush</span>
          </span>
          <span className="hidden sm:inline text-xs font-medium tracking-widest uppercase text-muted-foreground">{t("nav.academy")}</span>
        </a>

        <div className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-foreground/70 hover:text-accent transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full">
              {item.label}
            </a>
          ))}
          <LanguageSwitcher />
          <ThemeToggle />
          <Link to="/auth" className="border border-border text-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
            {t("nav.login")}
          </Link>
          <a href="#contact" className="bg-accent text-accent-foreground px-5 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all">
            {t("nav.bookConsultation")}
          </a>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-foreground" aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-card/98 backdrop-blur-md border-t border-border overflow-hidden">
            <div className="container mx-auto py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground/80 hover:text-accent py-2 transition-colors">
                  {item.label}
                </a>
              ))}
              <div className="py-2"><LanguageSwitcher /></div>
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground/80 hover:text-accent py-2 transition-colors">
                {t("nav.login")}
              </Link>
              <a href="#contact" onClick={() => setMobileOpen(false)} className="bg-accent text-accent-foreground px-5 py-2.5 rounded-xl text-sm font-semibold text-center hover:opacity-90 transition-opacity mt-2">
                {t("nav.bookConsultation")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
