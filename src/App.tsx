import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/common/LoadingSpinner";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isNewUser } = useAuth();
  
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  if (isNewUser) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
}

// Public route - redirects to dashboard if already logged in
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isNewUser } = useAuth();
  
  if (isLoading) return <PageLoader />;
  if (user && profile && !isNewUser) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/meetings" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/minutes" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
