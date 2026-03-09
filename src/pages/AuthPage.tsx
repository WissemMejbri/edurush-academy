import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, BookOpen, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup";
type Role = "student" | "teacher" | "admin";

const roleConfig = {
  student: { icon: GraduationCap, color: "bg-accent/10 text-accent" },
  teacher: { icon: BookOpen, color: "bg-primary/10 text-primary" },
  admin: { icon: Shield, color: "bg-destructive/10 text-destructive" },
};

const AuthPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in and redirect to their dashboard
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch user role from database
        const { data: roleData } = await supabase
          .rpc("get_user_role", { _user_id: session.user.id });
        
        const userRole = roleData || session.user.user_metadata?.role || "student";
        navigate(`/dashboard/${userRole}`);
      }
    };
    
    checkAuthAndRedirect();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        
        // Auto-confirmed: redirect immediately to dashboard
        if (data.user) {
          toast({ title: t("auth.signupSuccess") });
          navigate(`/dashboard/${role}`);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Fetch the user's actual role from database
        if (data.user) {
          const { data: roleData } = await supabase
            .rpc("get_user_role", { _user_id: data.user.id });
          
          const userRole = roleData || data.user.user_metadata?.role || "student";
          
          toast({ title: t("auth.loginSuccess") });
          navigate(`/dashboard/${userRole}`);
        }
      }
    } catch (err: any) {
      toast({ title: err.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("auth.backToHome")}
        </Link>

        <div className="bg-card rounded-2xl border border-border p-8 premium-shadow">
          <div className="text-center mb-8">
            <span className="font-display text-2xl font-bold text-primary">
              Edu<span className="text-accent">Rush</span>
            </span>
            <h1 className="font-display text-2xl font-bold text-foreground mt-4">
              {mode === "login" ? t("auth.login") : t("auth.signup")}
            </h1>
          </div>

          {/* Role selector - only show for signup */}
          {mode === "signup" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">{t("auth.loginAs")}</label>
              <div className="grid grid-cols-3 gap-2">
                {(["student", "teacher"] as Role[]).map((r) => {
                  const { icon: Icon, color } = roleConfig[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        role === r ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{t(`auth.${r}`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("auth.fullName")}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("auth.password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="rounded border-input" />
                  {t("auth.rememberMe")}
                </label>
                <button type="button" className="text-accent hover:underline">{t("auth.forgotPassword")}</button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-accent-foreground px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50"
            >
              {loading ? "..." : mode === "login" ? t("auth.login") : t("auth.signup")}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-accent font-semibold hover:underline">
              {mode === "login" ? t("auth.signup") : t("auth.login")}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
