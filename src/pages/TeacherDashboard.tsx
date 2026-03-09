import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Calendar, FileText, BookOpen, MessageSquare,
  Settings, LogOut, ClipboardCheck, Home, UserCog
} from "lucide-react";
import { BookingRequestCard } from "@/components/BookingRequestCard";
import { TeacherProfileSetup } from "@/components/TeacherProfileSetup";

const menuItems = [
  { key: "myStudents", icon: Users },
  { key: "courseMaterials", icon: BookOpen },
  { key: "assignments", icon: FileText },
  { key: "sessionCalendar", icon: Calendar },
  { key: "bookingRequests", icon: ClipboardCheck },
  { key: "messages", icon: MessageSquare },
  { key: "profileSetup", icon: UserCog },
  { key: "settings", icon: Settings },
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
  student_name?: string;
}

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("bookingRequests");
  const [sessions, setSessions] = useState<BookingSession[]>([]);

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

  const fetchSessions = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("booking_sessions")
      .select("*")
      .eq("teacher_id", user.id)
      .order("requested_date", { ascending: true });
    
    if (data) {
      const studentIds = [...new Set(data.map(s => s.student_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", studentIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
      
      setSessions(data.map(s => ({
        ...s,
        student_name: profileMap.get(s.student_id) || "Unknown Student"
      })));
    }
  };

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  const pendingSessions = sessions.filter(s => s.status === "pending");
  const upcomingSessions = sessions.filter(s => s.status === "accepted");
  const completedSessions = sessions.filter(s => s.status === "completed");
  const uniqueStudents = new Set(sessions.map(s => s.student_id)).size;

  const renderContent = () => {
    if (activeTab === "profileSetup") {
      return <TeacherProfileSetup userId={user.id} />;
    }

    return (
      <>
        {/* Quick stats - all dynamic */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: t("dashboard.myStudents"), value: String(uniqueStudents), icon: Users },
            { label: t("dashboard.upcomingSessions"), value: String(upcomingSessions.length), icon: Calendar },
            { label: t("dashboard.bookingRequests"), value: String(pendingSessions.length), icon: ClipboardCheck },
            { label: "Completed", value: String(completedSessions.length), icon: FileText },
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
          {/* Booking Requests */}
          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              {t("dashboard.bookingRequests")}
            </h3>
            <div className="space-y-3">
              {pendingSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending requests</p>
              ) : (
                pendingSessions.slice(0, 5).map((session) => (
                  <BookingRequestCard
                    key={session.id}
                    session={session}
                    onStatusChange={fetchSessions}
                    variant="teacher"
                  />
                ))
              )}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              {t("dashboard.sessionCalendar")}
            </h3>
            <div className="space-y-3">
              {upcomingSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("dashboard.noSessions")}</p>
              ) : (
                upcomingSessions.slice(0, 5).map((session) => (
                  <BookingRequestCard
                    key={session.id}
                    session={session}
                    onStatusChange={fetchSessions}
                    variant="teacher"
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

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
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === key ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {key === "profileSetup" ? "Profile Setup" : t(`dashboard.${key}`)}
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

          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
