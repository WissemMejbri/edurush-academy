import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Skills", href: "#skills" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-card/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20">
        <a href="#home" className="flex items-center gap-2">
          <span className="font-display text-xl md:text-2xl font-bold text-primary">
            Edu<span className="text-accent">Rush</span>
          </span>
          <span className={`hidden sm:inline text-xs font-medium tracking-widest uppercase ${scrolled ? "text-muted-foreground" : "text-primary-foreground/70"} transition-colors`} style={!scrolled ? { color: "hsl(var(--muted-foreground))" } : {}}>
            Academy
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="bg-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Book a Consultation
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card/98 backdrop-blur-md border-t border-border overflow-hidden"
          >
            <div className="container mx-auto py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-foreground/80 hover:text-accent py-2 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="bg-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold text-center hover:opacity-90 transition-opacity mt-2"
              >
                Book a Consultation
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
