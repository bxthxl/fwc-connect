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
import ProfilePage from "./pages/ProfilePage";
import MeetingsPage from "./pages/MeetingsPage";
import MinutesPage from "./pages/MinutesPage";
import EventsPage from "./pages/EventsPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import MembersPage from "./pages/admin/MembersPage";
import MeetingsManagementPage from "./pages/admin/MeetingsManagementPage";
import AttendancePage from "./pages/admin/AttendancePage";
import MinutesManagementPage from "./pages/admin/MinutesManagementPage";
import AnnouncementsPage from "./pages/admin/AnnouncementsPage";
import SongsManagementPage from "./pages/admin/SongsManagementPage";
import EventsManagementPage from "./pages/admin/EventsManagementPage";
import SongsPage from "./pages/SongsPage";
import BirthdaysPage from "./pages/BirthdaysPage";
import DiscussionsPage from "./pages/DiscussionsPage";
import OnboardingSettingsPage from "./pages/admin/OnboardingSettingsPage";
import BGVSelectorPage from "./pages/admin/BGVSelectorPage";
import WuyeSettingsPage from "./pages/admin/WuyeSettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isNewUser } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  if (isNewUser) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AdminRoute({ children, requireAdmin = false, requireAttendance = false, requireMinutes = false }: { 
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAttendance?: boolean;
  requireMinutes?: boolean;
}) {
  const { user, isLoading, isNewUser, isAdmin, canTakeAttendance, canManageMinutes } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  if (isNewUser) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (requireAttendance && !canTakeAttendance) return <Navigate to="/dashboard" replace />;
  if (requireMinutes && !canManageMinutes) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

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
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Member Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/meetings" element={<ProtectedRoute><MeetingsPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
      <Route path="/minutes" element={<ProtectedRoute><MinutesPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/songs" element={<ProtectedRoute><SongsPage /></ProtectedRoute>} />
      <Route path="/birthdays" element={<ProtectedRoute><BirthdaysPage /></ProtectedRoute>} />
      <Route path="/discussions" element={<ProtectedRoute><DiscussionsPage /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute requireAdmin><AdminOverviewPage /></AdminRoute>} />
      <Route path="/admin/members" element={<AdminRoute requireAdmin><MembersPage /></AdminRoute>} />
      <Route path="/admin/meetings" element={<AdminRoute requireAdmin><MeetingsManagementPage /></AdminRoute>} />
      <Route path="/admin/events" element={<AdminRoute requireAdmin><EventsManagementPage /></AdminRoute>} />
      <Route path="/admin/attendance" element={<AdminRoute requireAttendance><AttendancePage /></AdminRoute>} />
      <Route path="/admin/minutes" element={<AdminRoute requireMinutes><MinutesManagementPage /></AdminRoute>} />
      <Route path="/admin/announcements" element={<AdminRoute requireAdmin><AnnouncementsPage /></AdminRoute>} />
      <Route path="/admin/songs" element={<AdminRoute requireAdmin><SongsManagementPage /></AdminRoute>} />
      <Route path="/admin/onboarding" element={<AdminRoute requireAdmin><OnboardingSettingsPage /></AdminRoute>} />
      <Route path="/admin/bgv-selector" element={<AdminRoute requireAdmin><BGVSelectorPage /></AdminRoute>} />
      <Route path="/admin/wuye-settings" element={<AdminRoute requireAdmin><WuyeSettingsPage /></AdminRoute>} />
      
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
