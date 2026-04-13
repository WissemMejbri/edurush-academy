import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, GraduationCap, BookOpen, Calendar, BarChart3,
  Settings, LogOut, Home, UserCog, UserPlus, Menu, ClipboardList, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import edurushLogo from "@/assets/edurush-logo.jpeg";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email?: string;
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
  notes: string | null;
  created_at: string;
  student_name?: string;
  student_email?: string;
  teacher_name?: string;
}

interface GuestRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  level: string;
  requested_date: string;
  requested_time: string;
  notes: string | null;
  status: string;
  created_at: string;
}

const sidebarItems = [
  { key: "overview", icon: BarChart3, label: "Overview" },
  { key: "tutoringRequests", icon: ClipboardList, label: "Tutoring Requests" },
  { key: "guestRequests", icon: UserCheck, label: "Guest Requests" },
  { key: "manageUsers", icon: Users, label: "Manage Users" },
  { key: "addTeacher", icon: UserPlus, label: "Add Teacher" },
  { key: "manageSessions", icon: Calendar, label: "Manage Sessions" },
  { key: "settings", icon: Settings, label: "Settings" },
];

const requestStatuses = [
  { value: "pending", label: "Pending" },
  { value: "tutor_assigned", label: "Tutor Assigned" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0, sessions: 0, pending: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teachers, setTeachers] = useState<{ user_id: string; full_name: string }[]>([]);
  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>([]);

  // Add teacher form
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ fullName: "", email: "", password: "", subjects: "" });
  const [addingTeacher, setAddingTeacher] = useState(false);

  // Edit teacher dialog
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [editName, setEditName] = useState("");

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
    const { data: rolesData } = await supabase.from("user_roles").select("id, user_id, role");
    const { data: profilesData } = await supabase.from("profiles").select("user_id, full_name, created_at");

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

      // Build teachers list
      const teacherList = rolesData
        .filter(r => r.role === "teacher")
        .map(r => ({
          user_id: r.user_id,
          full_name: profileMap.get(r.user_id)?.full_name || "Unknown",
        }));
      setTeachers(teacherList);

      setStats(prev => ({
        ...prev,
        students: rolesData.filter(r => r.role === "student").length,
        teachers: rolesData.filter(r => r.role === "teacher").length,
      }));
    }

    const { data: sessionsData } = await supabase
      .from("booking_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (sessionsData) {
      const userIds = [...new Set([...sessionsData.map(s => s.student_id), ...sessionsData.map(s => s.teacher_id)])];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
      setSessions(sessionsData.map(s => ({
        ...s,
        student_name: nameMap.get(s.student_id) || "Unknown",
        teacher_name: nameMap.get(s.teacher_id) || "Unassigned",
      })));
      setStats(prev => ({ ...prev, sessions: sessionsData.length, pending: sessionsData.filter(s => s.status === "pending").length }));
    }

    // Fetch guest booking requests
    const { data: guestData } = await supabase
      .from("guest_booking_requests" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (guestData) {
      setGuestRequests(guestData as any as GuestRequest[]);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("user_id", userId);
    if (error) toast({ title: "Failed to update role", variant: "destructive" });
    else { toast({ title: "Role updated" }); fetchData(); }
  };

  const handleStatusChange = async (sessionId: string, newStatus: string) => {
    const { error } = await supabase
      .from("booking_sessions")
      .update({ status: newStatus } as any)
      .eq("id", sessionId);
    if (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Status updated" });

      // Send notification for status changes
      const session = sessions.find(s => s.id === sessionId);
      if (session && (newStatus === "tutor_assigned" || newStatus === "scheduled" || newStatus === "declined")) {
        supabase.functions.invoke("booking-notifications", {
          body: {
            session_id: sessionId,
            event_type: newStatus === "declined" ? "declined" : newStatus,
          },
        }).catch(console.error);
      }

      fetchData();
    }
  };

  const handleAssignTeacher = async (sessionId: string, teacherId: string) => {
    const { error } = await supabase
      .from("booking_sessions")
      .update({ teacher_id: teacherId, status: "tutor_assigned" } as any)
      .eq("id", sessionId);
    if (error) {
      toast({ title: "Failed to assign tutor", variant: "destructive" });
    } else {
      toast({ title: "Tutor assigned" });
      supabase.functions.invoke("booking-notifications", {
        body: { session_id: sessionId, event_type: "tutor_assigned" },
      }).catch(console.error);
      fetchData();
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.fullName || !newTeacher.email || !newTeacher.password || !newTeacher.subjects) return;
    setAddingTeacher(true);
    try {
      const subjectsArray = newTeacher.subjects.split(",").map(s => s.trim()).filter(Boolean);
      const { error } = await supabase.functions.invoke("admin-create-teacher", {
        body: { full_name: newTeacher.fullName, email: newTeacher.email, password: newTeacher.password, subjects: subjectsArray },
      });
      if (error) throw error;
      toast({ title: "Teacher created!", description: `${newTeacher.email} can now log in.` });
      setNewTeacher({ fullName: "", email: "", password: "", subjects: "" });
      setAddTeacherOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: err.message || "Failed to create teacher", variant: "destructive" });
    } finally {
      setAddingTeacher(false);
    }
  };

  const handleEditProfile = async () => {
    if (!editUser) return;
    const { error } = await supabase.from("profiles").update({ full_name: editName }).eq("user_id", editUser.user_id);
    if (error) toast({ title: "Failed to update", variant: "destructive" });
    else { toast({ title: "Profile updated" }); setEditUser(null); fetchData(); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "tutoringRequests":
        return (
          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> Tutoring Requests / Program Applications
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Preferred Date & Time</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assign Tutor</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{s.student_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">{s.subject}</p>
                        <p className="text-xs text-muted-foreground">{s.level}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(s.requested_date).toLocaleDateString()} at {s.requested_time}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(s.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={s.teacher_id === s.student_id ? "" : s.teacher_id}
                          onValueChange={(v) => handleAssignTeacher(s.id, v)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Assign tutor..." />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map(t => (
                              <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={s.status}
                          onValueChange={(v) => handleStatusChange(s.id, v)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {requestStatuses.map(st => (
                              <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No tutoring requests yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "guestRequests":
        return (
          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5" /> Guest Requests
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Preferred Date & Time</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guestRequests.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{g.full_name}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">Guest</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{g.email}</TableCell>
                      <TableCell className="text-muted-foreground">{g.phone || "—"}</TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">{g.subject}</p>
                        <p className="text-xs text-muted-foreground">{g.level}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(g.requested_date).toLocaleDateString()} at {g.requested_time}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(g.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={g.status} />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={g.status}
                          onValueChange={async (v) => {
                            const { error } = await supabase
                              .from("guest_booking_requests" as any)
                              .update({ status: v } as any)
                              .eq("id", g.id);
                            if (error) toast({ title: "Failed to update", variant: "destructive" });
                            else { toast({ title: "Status updated" }); fetchData(); }
                          }}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {requestStatuses.map(st => (
                              <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {guestRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No guest requests yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "manageUsers":
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
                        <div className="flex items-center gap-2">
                          <Select defaultValue={u.role} onValueChange={(v) => handleRoleChange(u.user_id, v)}>
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" onClick={() => { setEditUser(u); setEditName(u.full_name || ""); }}>
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "addTeacher":
        return (
          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm max-w-lg">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Add New Teacher
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Create a teacher account. They will receive login credentials automatically.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={newTeacher.fullName} onChange={e => setNewTeacher(p => ({ ...p, fullName: e.target.value }))} placeholder="Teacher name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={newTeacher.email} onChange={e => setNewTeacher(p => ({ ...p, email: e.target.value }))} placeholder="teacher@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={newTeacher.password} onChange={e => setNewTeacher(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" minLength={6} />
              </div>
              <div className="space-y-2">
                <Label>Subjects</Label>
                <Input value={newTeacher.subjects} onChange={e => setNewTeacher(p => ({ ...p, subjects: e.target.value }))} placeholder="Math, Physics, Chemistry (comma-separated)" />
                <p className="text-xs text-muted-foreground">Separate multiple subjects with commas</p>
              </div>
              <Button onClick={handleAddTeacher} disabled={addingTeacher || !newTeacher.fullName || !newTeacher.email || !newTeacher.password || !newTeacher.subjects} className="w-full">
                {addingTeacher ? "Creating..." : "Create Teacher Account"}
              </Button>
            </div>
          </div>
        );

      case "manageSessions":
        return (
          <div className="bg-card rounded-2xl border border-border p-6 premium-shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> All Sessions
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
                        <StatusBadge status={s.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      default: // overview
        return (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {[
                { label: "Total Students", value: String(stats.students), icon: Users },
                { label: "Total Teachers", value: String(stats.teachers), icon: GraduationCap },
                { label: "Total Requests", value: String(stats.sessions), icon: Calendar },
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
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Requests</h3>
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.subject}</p>
                        <p className="text-xs text-muted-foreground">{s.student_name}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <span className="font-display text-lg font-bold text-primary">EduRush Admin</span>
        <div className="w-5" />
      </div>

      <aside className={`w-64 bg-card border-r border-border p-6 flex-col fixed md:static top-0 left-0 h-full z-40 transition-transform ${
        mobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full md:translate-x-0 md:flex hidden"
      }`}>
        <a href="/" className="font-display text-xl font-bold text-primary mb-8 flex items-center gap-2">
          <img src={edurushLogo} alt="EduRush" className="h-10 w-10 rounded-full object-cover" />
          Edu<span className="text-accent">Rush</span>
        </a>
        <nav className="flex-1 space-y-1">
          {sidebarItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === key ? "bg-accent/10 text-accent shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <main className="flex-1 p-6 md:p-10 pt-20 md:pt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t("dashboard.welcome")}, Admin 👋
            </h1>
            <p className="text-muted-foreground mb-8">{t("auth.admin")} Dashboard</p>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Update the user's display name.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleEditProfile}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
