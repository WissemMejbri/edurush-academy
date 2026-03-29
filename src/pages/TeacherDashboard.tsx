import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Calendar, FileText, BookOpen, MessageSquare,
  Settings, LogOut, ClipboardCheck, Home, UserCog, Menu, Video, Link as LinkIcon
} from "lucide-react";
import { BookingRequestCard } from "@/components/BookingRequestCard";
import { TeacherProfileSetup } from "@/components/TeacherProfileSetup";
import { TeacherAvailability } from "@/components/dashboard/TeacherAvailability";
import { SessionCalendar } from "@/components/dashboard/SessionCalendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import edurushLogo from "@/assets/edurush-logo.jpeg";

const menuItems = [
  { key: "overview", icon: BookOpen },
  { key: "bookingRequests", icon: ClipboardCheck },
  { key: "sessionCalendar", icon: Calendar },
  { key: "myStudents", icon: Users },
  { key: "courseMaterials", icon: BookOpen },
  { key: "assignments", icon: FileText },
  { key: "messages", icon: MessageSquare },
  { key: "availability", icon: Calendar },
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
  proposed_date?: string | null;
  proposed_time?: string | null;
  recording_url?: string | null;
}

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Recording submission
  const [recordingSession, setRecordingSession] = useState<BookingSession | null>(null);
  const [recordingUrl, setRecordingUrl] = useState("");
  const [submittingRecording, setSubmittingRecording] = useState(false);

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
  }, [user]);

  useEffect(() => {
    if (user) fetchSessions();
  }, [user, fetchSessions]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSubmitRecording = async () => {
    if (!recordingSession || !recordingUrl) return;
    setSubmittingRecording(true);
    try {
      const { error } = await supabase
        .from("booking_sessions")
        .update({ recording_url: recordingUrl } as any)
        .eq("id", recordingSession.id);
      if (error) throw error;
      toast({ title: "Recording submitted!", description: "The admin can now view the recording." });
      setRecordingSession(null);
      setRecordingUrl("");
      fetchSessions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingRecording(false);
    }
  };

  if (!user) return null;

  const pendingSessions = sessions.filter(s => s.status === "pending");
  const upcomingSessions = sessions.filter(s => s.status === "accepted" || s.status === "scheduled" || s.status === "tutor_assigned");
  const completedSessions = sessions.filter(s => s.status === "completed");
  const uniqueStudents = new Set(sessions.map(s => s.student_id)).size;

  const getLabel = (key: string) => {
    const map: Record<string, string> = {
      overview: "Overview",
      bookingRequests: t("dashboard.bookingRequests"),
      sessionCalendar: t("dashboard.sessionCalendar"),
      myStudents: t("dashboard.myStudents"),
      courseMaterials: t("dashboard.courseMaterials"),
      assignments: t("dashboard.assignments"),
      messages: t("dashboard.messages"),
      availability: "Availability",
      profileSetup: "Profile Setup",
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
              <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">{t("dashboard.bookingRequests")}</h3>
                <div className="space-y-3">
                  {pendingSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending requests</p>
                  ) : pendingSessions.slice(0, 5).map(session => (
                    <BookingRequestCard key={session.id} session={session} onStatusChange={fetchSessions} variant="teacher" />
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Sessions Needing Recordings</h3>
                <div className="space-y-3">
                  {completedSessions.filter(s => !s.recording_url).length === 0 ? (
                    <p className="text-sm text-muted-foreground">All recordings submitted ✓</p>
                  ) : completedSessions.filter(s => !s.recording_url).slice(0, 5).map(session => (
                    <div key={session.id} className="bg-card rounded-xl border border-border p-4 premium-shadow-sm space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{session.subject} — {session.level}</p>
                          <p className="text-xs text-muted-foreground">{session.student_name} · {new Date(session.requested_date).toLocaleDateString()}</p>
                        </div>
                        <StatusBadge status={session.status} />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setRecordingSession(session); setRecordingUrl(""); }}
                        className="gap-1"
                      >
                        <Video className="w-3.5 h-3.5" /> Submit Recording
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      case "bookingRequests":
        return (
          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">{t("dashboard.bookingRequests")}</h3>
            <div className="space-y-3">
              {pendingSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending requests</p>
              ) : pendingSessions.map(session => (
                <BookingRequestCard key={session.id} session={session} onStatusChange={fetchSessions} variant="teacher" />
              ))}
            </div>
          </div>
        );
      case "sessionCalendar":
        return <SessionCalendar sessions={sessions} variant="teacher" />;
      case "availability":
        return <TeacherAvailability userId={user.id} />;
      case "profileSetup":
        return <TeacherProfileSetup userId={user.id} />;
      case "myStudents":
      case "courseMaterials":
      case "assignments":
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
            <p className="text-sm text-muted-foreground">Settings coming soon.</p>
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
        <div className="w-5" />
      </div>

      {/* Sidebar */}
      <aside className={`w-64 bg-card border-r border-border p-6 flex-col fixed md:static top-0 left-0 h-full z-40 transition-transform ${
        mobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full md:translate-x-0 md:flex hidden"
      }`}>
        <a href="/" className="font-display text-xl font-bold text-primary mb-8 flex items-center gap-2">
          <img src={edurushLogo} alt="EduRush" className="h-10 w-10 rounded-full object-cover" />
          Edu<span className="text-accent">Rush</span>
        </a>
        <nav className="flex-1 space-y-1 overflow-y-auto">
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

      {/* Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 pt-20 md:pt-10">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t("dashboard.welcome")}, {user.user_metadata?.full_name || user.email?.split("@")[0]} 👋
        </h1>
        <p className="text-muted-foreground mb-8">{t("auth.teacher")} Dashboard</p>

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

      {/* Submit Recording Dialog */}
      <Dialog open={!!recordingSession} onOpenChange={() => setRecordingSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" /> Submit Session Recording
            </DialogTitle>
            <DialogDescription>
              Submit the recording for {recordingSession?.subject} session with {recordingSession?.student_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Recording Link
              </Label>
              <Input
                placeholder="https://zoom.us/rec/... or Google Drive link"
                value={recordingUrl}
                onChange={e => setRecordingUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste a Zoom recording link, Google Drive link, or any accessible URL.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordingSession(null)}>Cancel</Button>
            <Button onClick={handleSubmitRecording} disabled={submittingRecording || !recordingUrl}>
              {submittingRecording ? "Submitting..." : "Submit Recording"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
