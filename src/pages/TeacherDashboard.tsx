import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Calendar, FileText, BookOpen, MessageSquare,
  Settings, LogOut, ClipboardCheck, Home
} from "lucide-react";

const menuItems = [
  { key: "myStudents", icon: Users },
  { key: "courseMaterials", icon: BookOpen },
  { key: "assignments", icon: FileText },
  { key: "sessionCalendar", icon: Calendar },
  { key: "bookingRequests", icon: ClipboardCheck },
  { key: "messages", icon: MessageSquare },
  { key: "settings", icon: Settings },
];

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border p-6 hidden md:flex flex-col">
        <a href="/" className="font-display text-xl font-bold text-primary mb-8 block">
          Edu<span className="text-accent">Rush</span>
        </a>
        <nav className="flex-1 space-y-1">
          {menuItems.map(({ key, icon: Icon }) => (
            <button
              key={key}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Icon className="w-4 h-4" />
              {t(`dashboard.${key}`)}
            </button>
          ))}
        </nav>
        <div className="space-y-2">
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Home className="w-4 h-4" /> {t("auth.backToHome")}
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-4 h-4" /> {t("dashboard.logout")}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t("dashboard.welcome")}, {user.user_metadata?.full_name || user.email?.split("@")[0]} 👋
          </h1>
          <p className="text-muted-foreground mb-8">{t("auth.teacher")} Dashboard</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { label: t("dashboard.myStudents"), value: "12", icon: Users },
              { label: t("dashboard.upcomingSessions"), value: "4", icon: Calendar },
              { label: t("dashboard.bookingRequests"), value: "3", icon: ClipboardCheck },
              { label: t("dashboard.messages"), value: "2", icon: MessageSquare },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-card rounded-2xl border border-border p-5 premium-shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-5 h-5 text-accent" />
                  <span className="text-2xl font-bold text-foreground">{value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">{t("dashboard.bookingRequests")}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Amira K. — IB Mathematics</p>
                    <p className="text-xs text-muted-foreground">March 15 at 18:00</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-semibold bg-accent text-accent-foreground rounded-lg">Accept</button>
                    <button className="px-3 py-1.5 text-xs font-semibold bg-secondary text-secondary-foreground rounded-lg">Decline</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">{t("dashboard.sessionCalendar")}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">IGCSE Physics — David L.</p>
                    <p className="text-xs text-muted-foreground">Today at 15:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">A Level Chemistry — Fatima H.</p>
                    <p className="text-xs text-muted-foreground">Tomorrow at 10:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
