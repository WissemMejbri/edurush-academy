import { Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary pt-20 pb-8">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div>
            <span className="font-display text-2xl font-bold text-primary-foreground">
              Edu<span className="text-accent">Rush</span>
            </span>
            <p className="text-primary-foreground/50 mt-4 text-sm leading-relaxed max-w-xs">
              Empowering students worldwide with expert academic support for Cambridge IGCSE, AS & A Levels, and IB programs.
            </p>
            <div className="flex gap-3 mt-6">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-accent/20 transition-colors"
                >
                  <Icon className="w-4 h-4 text-primary-foreground/60 hover:text-accent" />
                </a>
              ))}
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-display text-base font-bold text-primary-foreground mb-5">Programs</h4>
            <ul className="space-y-3">
              {["Cambridge IGCSE", "AS & A Levels", "International Baccalaureate", "Skills Development"].map((l) => (
                <li key={l}>
                  <a href="#programs" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-base font-bold text-primary-foreground mb-5">Resources</h4>
            <ul className="space-y-3">
              {["About Us", "How It Works", "Our Tutors", "Testimonials", "Blog"].map((l) => (
                <li key={l}>
                  <a href={`#${l.toLowerCase().replace(/ /g, "-").replace("about-us", "about")}`} className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-base font-bold text-primary-foreground mb-5">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-primary-foreground/50">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                Tunis, Tunisia (Fully Online)
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/50">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                contact@edurushacademy.com
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/50">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                +216 XX XXX XXX
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()} EduRush Academy. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
              <a key={l} href="#" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
