import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, GraduationCap, BookOpen, Calendar, BarChart3,
  Settings, LogOut, Home, Shield, Trash2, UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface BookingSession {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  level: string;
  requested_date: string;
  requested_time: string;
  status: string;
  student_name?: string;
  teacher_name?: string;
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("manageUsers");
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0, sessions: 0, pending: 0 });

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

  const fetchData = async () => {
    // Fetch user roles with profiles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("id, user_id, role");
    
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, created_at");
    
    if (rolesData && profilesData) {
      const profileMap = new Map(profilesData.map(p => [p.user_id, p]));
      const usersWithRoles: UserWithRole[] = rolesData.map(r => ({
        id: r.id,
        user_id: r.user_id,
        full_name: profileMap.get(r.user_id)?.full_name || "Unknown",
        role: r.role,
        created_at: profileMap.get(r.user_id)?.created_at || "",
      }));
      setUsers(usersWithRoles);
      
      // Calculate stats
      const studentCount = rolesData.filter(r => r.role === "student").length;
      const teacherCount = rolesData.filter(r => r.role === "teacher").length;
      setStats(prev => ({ ...prev, students: studentCount, teachers: teacherCount }));
    }

    // Fetch all sessions
    const { data: sessionsData } = await supabase
      .from("booking_sessions")
      .select("*")
      .order("requested_date", { ascending: false });
    
    if (sessionsData) {
      // Get all user IDs for names
      const userIds = [...new Set([
        ...sessionsData.map(s => s.student_id),
        ...sessionsData.map(s => s.teacher_id)
      ])];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      
      const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
      
      setSessions(sessionsData.map(s => ({
        ...s,
        student_name: nameMap.get(s.student_id) || "Unknown",
        teacher_name: nameMap.get(s.teacher_id) || "Unknown",
      })));
      
      const pendingCount = sessionsData.filter(s => s.status === "pending").length;
      setStats(prev => ({ ...prev, sessions: sessionsData.length, pending: pendingCount }));
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole as "admin" | "student" | "teacher" })
      .eq("user_id", userId);
    
    if (error) {
      toast({ title: "Failed to update role", variant: "destructive" });
    } else {
      toast({ title: "Role updated successfully" });
      fetchData();
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    // Note: DELETE RLS policy needed for this to work
    toast({ title: "Session deletion requires admin backend API", variant: "destructive" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600",
    accepted: "bg-green-500/10 text-green-600",
    declined: "bg-red-500/10 text-red-600",
    completed: "bg-blue-500/10 text-blue-600",
  };

  const renderContent = () => {
    if (activeTab === "manageUsers") {
      return (
        <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <UserCog className="w-5 h-5" /> User Management
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "destructive" : u.role === "teacher" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={u.role}
                        onValueChange={(value) => handleRoleChange(u.user_id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    if (activeTab === "manageSessions") {
      return (
        <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> All Booking Sessions
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student_name}</TableCell>
                    <TableCell>{s.teacher_name}</TableCell>
                    <TableCell>{s.subject} ({s.level})</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(s.requested_date).toLocaleDateString()} at {s.requested_time}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[s.status] || ""}>
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );
    }

    // Default: Overview
    return (
      <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { label: "Total Students", value: String(stats.students), icon: Users },
            { label: "Total Teachers", value: String(stats.teachers), icon: GraduationCap },
            { label: "Total Sessions", value: String(stats.sessions), icon: Calendar },
            { label: "Pending Requests", value: String(stats.pending), icon: BookOpen },
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
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Users</h3>
            <div className="space-y-3">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                  </div>
                  <Badge variant="outline">{u.role}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Sessions</h3>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.subject}</p>
                    <p className="text-xs text-muted-foreground">{s.student_name} → {s.teacher_name}</p>
                  </div>
                  <Badge className={statusColors[s.status] || ""}>{s.status}</Badge>
                </div>
              ))}
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
          {[
            { key: "overview", icon: BarChart3, label: "Overview" },
            { key: "manageUsers", icon: Users, label: "Manage Users" },
            { key: "manageSessions", icon: Calendar, label: "Manage Sessions" },
            { key: "settings", icon: Settings, label: "Settings" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === key ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
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

          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
