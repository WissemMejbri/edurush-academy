import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings } from "lucide-react";

const CookieConsent = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [prefs, setPrefs] = useState({ essential: true, analytics: false, marketing: false });

  useEffect(() => {
    const consent = localStorage.getItem("edurush_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (type: "all" | "essential" | "custom") => {
    const consent = type === "all"
      ? { essential: true, analytics: true, marketing: true }
      : type === "essential"
        ? { essential: true, analytics: false, marketing: false }
        : prefs;
    localStorage.setItem("edurush_cookie_consent", JSON.stringify(consent));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[60] p-4"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border rounded-2xl premium-shadow p-6 md:p-8">
            {!showCustomize ? (
              <>
                <div className="flex items-start gap-4 mb-6">
                  <Cookie className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80 leading-relaxed">{t("cookie.message")}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => accept("all")}
                    className="bg-accent text-accent-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all"
                  >
                    {t("cookie.acceptAll")}
                  </button>
                  <button
                    onClick={() => accept("essential")}
                    className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary/80 transition-colors"
                  >
                    {t("cookie.rejectNonEssential")}
                  </button>
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="border border-border text-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-colors inline-flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {t("cookie.customize")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-lg font-bold text-foreground">{t("cookie.customize")}</h3>
                  <button onClick={() => setShowCustomize(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4 mb-6">
                  {[
                    { key: "essential" as const, disabled: true },
                    { key: "analytics" as const, disabled: false },
                    { key: "marketing" as const, disabled: false },
                  ].map(({ key, disabled }) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t(`cookie.${key}`)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t(`cookie.${key}Desc`)}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prefs[key]}
                          onChange={(e) => !disabled && setPrefs({ ...prefs, [key]: e.target.checked })}
                          disabled={disabled}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-border peer-focus:ring-2 peer-focus:ring-accent/40 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent peer-disabled:opacity-60" />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => accept("custom")}
                    className="bg-accent text-accent-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all"
                  >
                    {t("cookie.savePreferences")}
                  </button>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="border border-border text-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    {t("cookie.back")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
