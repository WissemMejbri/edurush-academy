import { Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary pt-20 pb-8">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div>
            <span className="font-display text-2xl font-bold text-primary-foreground">Edu<span className="text-accent">Rush</span></span>
            <p className="text-primary-foreground/50 mt-4 text-sm leading-relaxed max-w-xs">{t("footer.description")}</p>
            <div className="flex gap-3 mt-6">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-accent/20 transition-colors">
                  <Icon className="w-4 h-4 text-primary-foreground/60" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-base font-bold text-primary-foreground mb-5">{t("footer.programs")}</h4>
            <ul className="space-y-3">
              {[t("programs.igcse"), t("programs.alevels"), t("programs.ib"), t("footer.skillsDev")].map((l) => (
                <li key={l}><a href="#programs" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base font-bold text-primary-foreground mb-5">{t("footer.resources")}</h4>
            <ul className="space-y-3">
              {[t("footer.aboutUs"), t("footer.howItWorks"), t("footer.ourTutors"), t("footer.testimonialsLink"), t("footer.blog")].map((l) => (
                <li key={l}><a href="#about" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base font-bold text-primary-foreground mb-5">{t("footer.contactTitle")}</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-primary-foreground/50"><MapPin className="w-4 h-4 text-accent flex-shrink-0" />{t("footer.location")}</div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/50"><Mail className="w-4 h-4 text-accent flex-shrink-0" />info.edurushacademy@gmail.com</div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/50"><Phone className="w-4 h-4 text-accent flex-shrink-0" />+216 48 044 486</div>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/40">© {new Date().getFullYear()} EduRush Academy. {t("footer.rights")}</p>
          <div className="flex gap-6">
            {[t("footer.privacy"), t("footer.terms"), t("footer.cookie")].map((l) => (
              <a key={l} href="#" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
