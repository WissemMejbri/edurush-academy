import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, Calendar, FileText, BarChart3, MessageSquare,
  Settings, LogOut, GraduationCap, Home, Plus, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookSessionDialog } from "@/components/BookSessionDialog";
import { BookingRequestCard } from "@/components/BookingRequestCard";
import { SessionCalendar } from "@/components/dashboard/SessionCalendar";
import edurushLogo from "@/assets/edurush-logo.jpeg";

const menuItems = [
  { key: "overview", icon: BookOpen, label: "Overview" },
  { key: "upcomingSessions", icon: Calendar, label: "" },
  { key: "sessionCalendar", icon: Calendar, label: "" },
  { key: "assignments", icon: FileText, label: "" },
  { key: "studyMaterials", icon: GraduationCap, label: "" },
  { key: "progressTracking", icon: BarChart3, label: "" },
  { key: "messages", icon: MessageSquare, label: "" },
  { key: "settings", icon: Settings, label: "" },
];

interface BookingSession {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  level: string;
  requested_date: string;
  requested_time: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  zoom_link: string | null;
}

const StudentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("booking_sessions")
      .select("*")
      .eq("student_id", user.id)
      .order("requested_date", { ascending: true });
    if (data) setSessions(data);
  }, [user]);

  useEffect(() => {
    if (user) fetchSessions();
  }, [user, fetchSessions]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  const pendingSessions = sessions.filter(s => s.status === "pending");
  const upcomingSessions = sessions.filter(s => s.status === "accepted");
  const completedSessions = sessions.filter(s => s.status === "completed");

  const getLabel = (key: string) => {
    const map: Record<string, string> = {
      overview: "Overview",
      upcomingSessions: t("dashboard.upcomingSessions"),
      sessionCalendar: t("dashboard.sessionCalendar"),
      assignments: t("dashboard.assignments"),
      studyMaterials: t("dashboard.studyMaterials"),
      progressTracking: t("dashboard.progressTracking"),
      messages: t("dashboard.messages"),
      settings: t("dashboard.settings"),
    };
    return map[key] || key;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {[
                { label: t("dashboard.upcomingSessions"), value: String(upcomingSessions.length), icon: Calendar },
                { label: "Pending", value: String(pendingSessions.length), icon: FileText },
                { label: "Total Sessions", value: String(sessions.length), icon: BookOpen },
                { label: "Completed", value: String(completedSessions.length), icon: BarChart3 },
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
                <h3 className="font-display text-lg font-bold text-foreground mb-4">{t("dashboard.upcomingSessions")}</h3>
                <div className="space-y-3">
                  {upcomingSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("dashboard.noSessions")}</p>
                  ) : upcomingSessions.slice(0, 3).map(session => (
                    <BookingRequestCard key={session.id} session={session} onStatusChange={fetchSessions} variant="student" />
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Pending Requests</h3>
                <div className="space-y-3">
                  {pendingSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("dashboard.noAssignments")}</p>
                  ) : pendingSessions.slice(0, 3).map(session => (
                    <BookingRequestCard key={session.id} session={session} onStatusChange={fetchSessions} variant="student" />
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      case "upcomingSessions":
        return (
          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{t("dashboard.upcomingSessions")}</h3>
            <div className="space-y-3">
              {upcomingSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("dashboard.noSessions")}</p>
              ) : upcomingSessions.map(session => (
                <BookingRequestCard key={session.id} session={session} onStatusChange={fetchSessions} variant="student" />
              ))}
            </div>
          </div>
        );
      case "sessionCalendar":
        return <SessionCalendar sessions={sessions} variant="student" />;
      case "assignments":
      case "studyMaterials":
      case "progressTracking":
      case "messages":
        return (
          <div className="bg-card rounded-2xl border border-border p-10 premium-shadow-sm text-center">
            <p className="text-muted-foreground">{getLabel(activeTab)} — Coming soon</p>
          </div>
        );
      case "settings":
        return (
          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{t("dashboard.settings")}</h3>
            <p className="text-sm text-muted-foreground">Profile settings coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <span className="font-display text-lg font-bold text-primary">EduRush</span>
        <Button size="sm" onClick={() => setBookDialogOpen(true)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`w-64 bg-card border-r border-border p-6 flex-col fixed md:static top-0 left-0 h-full z-40 transition-transform ${
        mobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full md:translate-x-0 md:flex hidden"
      }`}>
        <a href="/" className="font-display text-xl font-bold text-primary mb-8 flex items-center gap-2">
          <img src={edurushLogo} alt="EduRush" className="h-10 w-10 rounded-full object-cover" />
          Edu<span className="text-accent">Rush</span>
        </a>
        <nav className="flex-1 space-y-1">
          {menuItems.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === key
                  ? "bg-accent/10 text-accent shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {getLabel(key)}
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

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 pt-20 md:pt-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {t("dashboard.welcome")}, {user.user_metadata?.full_name || user.email?.split("@")[0]} 👋
          </h1>
          <Button onClick={() => setBookDialogOpen(true)} className="gap-2 hidden md:flex">
            <Plus className="w-4 h-4" />
            {t("dashboard.bookSession")}
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">{t("auth.student")} Dashboard</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BookSessionDialog open={bookDialogOpen} onOpenChange={setBookDialogOpen} onBooked={fetchSessions} />
    </div>
  );
};

export default StudentDashboard;
