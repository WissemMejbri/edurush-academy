import { Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary py-16">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <span className="font-display text-2xl font-bold text-primary-foreground">
              Edu<span className="text-accent">Rush</span>
            </span>
            <p className="text-primary-foreground/60 mt-4 text-sm leading-relaxed max-w-xs">
              Empowering students worldwide with expert academic support for Cambridge IGCSE, AS & A Levels, and International Baccalaureate programs.
            </p>
          </div>

          <div>
            <h4 className="font-display text-base font-bold text-primary-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {["About Us", "Programs", "Skills", "How It Works", "Contact"].map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase().replace(/ /g, "-").replace("about-us", "about")}`}
                    className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-base font-bold text-primary-foreground mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-primary-foreground/60">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                Tunis, Tunisia (Fully Online)
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/60">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                contact@edurushacademy.com
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-sm text-primary-foreground/40">
            © {new Date().getFullYear()} EduRush Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
