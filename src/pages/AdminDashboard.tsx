import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, GraduationCap, BookOpen, Calendar, BarChart3,
  Settings, LogOut, Home, Shield
} from "lucide-react";

const AdminDashboard = () => {
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
          {[
            { key: "manageStudents", icon: Users },
            { key: "manageTeachers", icon: GraduationCap },
            { key: "manageCourses", icon: BookOpen },
            { key: "manageSessions", icon: Calendar },
            { key: "progressTracking", icon: BarChart3 },
            { key: "manageContent", icon: Shield },
            { key: "settings", icon: Settings },
          ].map(({ key, icon: Icon }) => (
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
            {t("dashboard.welcome")}, Admin 👋
          </h1>
          <p className="text-muted-foreground mb-8">{t("auth.admin")} Dashboard</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { label: t("dashboard.manageStudents"), value: "128", icon: Users },
              { label: t("dashboard.manageTeachers"), value: "25", icon: GraduationCap },
              { label: t("dashboard.manageCourses"), value: "42", icon: BookOpen },
              { label: t("dashboard.manageSessions"), value: "18", icon: Calendar },
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

          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { text: "New student registration: Amira K.", time: "2 hours ago" },
                { text: "Session completed: IGCSE Mathematics", time: "4 hours ago" },
                { text: "New booking request: IB Chemistry HL", time: "5 hours ago" },
                { text: "Teacher profile updated: Dr. Sarah Mitchell", time: "1 day ago" },
              ].map(({ text, time }) => (
                <div key={text} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-foreground">{text}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
