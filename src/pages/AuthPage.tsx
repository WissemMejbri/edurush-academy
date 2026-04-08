import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, BookOpen, Shield, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
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
        if (data.user && !data.user.identities?.length) {
          toast({ title: "An account with this email already exists.", variant: "destructive" });
          return;
        }
        if (data.user) {
          toast({ title: t("auth.signupSuccess") });
          navigate(`/dashboard/${role}`);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Handle "Remember Me" — if unchecked, mark session for tab-only
        if (!rememberMe) {
          sessionStorage.setItem("edurush_session_only", "true");
        } else {
          sessionStorage.removeItem("edurush_session_only");
        }

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

  const handleForgotPassword = async () => {
    if (!resetEmail) return;
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Reset link sent!", description: "Check your email for the password reset link." });
      setForgotOpen(false);
      setResetEmail("");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setResetLoading(false);
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-input"
                  />
                  {t("auth.rememberMe")}
                </label>
                <button type="button" onClick={() => setForgotOpen(true)} className="text-accent hover:underline">
                  {t("auth.forgotPassword")}
                </button>
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

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("auth.forgotPassword")}</DialogTitle>
            <DialogDescription>Enter your email address and we'll send you a password reset link.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>Cancel</Button>
            <Button onClick={handleForgotPassword} disabled={resetLoading || !resetEmail}>
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthPage;
