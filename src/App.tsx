import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import "@/i18n";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRouteGuard from "./components/AdminRouteGuard";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Guest-only mode: student/teacher auth & dashboards are temporarily disabled.
// All public account routes redirect to the homepage. Admin access is preserved.
const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="/dashboard/student" element={<Navigate to="/" replace />} />
            <Route path="/dashboard/teacher" element={<Navigate to="/" replace />} />
            <Route path="/dashboard/admin" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
