import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login", { replace: true });
        return;
      }
      const { data } = await supabase.rpc("get_user_role", { _user_id: session.user.id });
      if (data !== "admin") {
        navigate("/admin/login", { replace: true });
        return;
      }
      setAuthorized(true);
      setChecking(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin/login", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checking && !authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
};

export default AdminRouteGuard;
