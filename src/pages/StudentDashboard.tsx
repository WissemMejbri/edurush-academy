import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, Calendar, FileText, BarChart3, MessageSquare,
  Settings, LogOut, GraduationCap, Home
} from "lucide-react";

const menuItems = [
  { key: "myCourses", icon: BookOpen },
  { key: "upcomingSessions", icon: Calendar },
  { key: "assignments", icon: FileText },
  { key: "studyMaterials", icon: GraduationCap },
  { key: "progressTracking", icon: BarChart3 },
  { key: "messages", icon: MessageSquare },
  { key: "settings", icon: Settings },
];

const StudentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("myCourses");

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
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden md:flex flex-col">
        <a href="/" className="font-display text-xl font-bold text-primary mb-8 block">
          Edu<span className="text-accent">Rush</span>
        </a>
        <nav className="flex-1 space-y-1">
          {menuItems.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === key ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
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

      {/* Main */}
      <main className="flex-1 p-6 md:p-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t("dashboard.welcome")}, {user.user_metadata?.full_name || user.email?.split("@")[0]} 👋
          </h1>
          <p className="text-muted-foreground mb-8">{t("auth.student")} Dashboard</p>

          {/* Quick stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { label: t("dashboard.myCourses"), value: "3", icon: BookOpen },
              { label: t("dashboard.upcomingSessions"), value: "2", icon: Calendar },
              { label: t("dashboard.assignments"), value: "5", icon: FileText },
              { label: t("dashboard.messages"), value: "1", icon: MessageSquare },
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

          {/* Content area */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">{t("dashboard.upcomingSessions")}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">IGCSE Mathematics</p>
                    <p className="text-xs text-muted-foreground">Tomorrow at 18:00 · Dr. Sarah Mitchell</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">IB Chemistry HL</p>
                    <p className="text-xs text-muted-foreground">Wed at 16:00 · Prof. Ahmed Benali</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">{t("dashboard.assignments")}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <FileText className="w-5 h-5 text-accent" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Physics Lab Report</p>
                    <p className="text-xs text-muted-foreground">Due: March 12</p>
                  </div>
                  <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">Pending</span>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <FileText className="w-5 h-5 text-accent" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Math Problem Set 5</p>
                    <p className="text-xs text-muted-foreground">Due: March 15</p>
                  </div>
                  <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StudentDashboard;
