import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Home,
  Calendar,
  CalendarDays,
  FileText,
  User,
  Users,
  ClipboardCheck,
  Settings,
  LogOut,
  Menu,
  Bell,
  Shield,
  PenTool,
  Megaphone,
  Music,
  Cake,
  MessageSquare,
  BookOpen,
  Shuffle,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import fwcLogo from '@/assets/fwc-logo.png';
import fwcWatermark from '@/assets/fwc-watermark.png';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ProfileCompletionDialog } from '@/components/common/ProfileCompletionDialog';
import { Chatbot } from '@/components/chat/Chatbot';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  attendanceOnly?: boolean;
  minutesOnly?: boolean;
}

const memberNavItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Meetings', href: '/meetings', icon: Calendar },
  { label: 'Events', href: '/events', icon: CalendarDays },
  { label: 'Songs', href: '/songs', icon: Music },
  { label: 'Minutes', href: '/minutes', icon: FileText },
  { label: 'Birthdays', href: '/birthdays', icon: Cake },
  { label: 'Discussions', href: '/discussions', icon: MessageSquare },
  { label: 'Profile', href: '/profile', icon: User },
];

const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: Shield, adminOnly: true },
  { label: 'Members', href: '/admin/members', icon: Users, adminOnly: true },
  { label: 'Meetings', href: '/admin/meetings', icon: Calendar, adminOnly: true },
  { label: 'Events', href: '/admin/events', icon: CalendarDays, adminOnly: true },
  { label: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck, attendanceOnly: true },
  { label: 'Minutes', href: '/admin/minutes', icon: PenTool, minutesOnly: true },
  { label: 'Songs', href: '/admin/songs', icon: Music, adminOnly: true },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone, adminOnly: true },
  { label: 'Onboarding', href: '/admin/onboarding', icon: BookOpen, adminOnly: true },
  { label: 'BGV Selector', href: '/admin/bgv-selector', icon: Shuffle, adminOnly: true },
  { label: 'Branch Settings', href: '/admin/branch-settings', icon: MapPin, adminOnly: true },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, isAdmin, isSuperAdmin, canTakeAttendance, canManageMinutes, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredAdminItems = adminNavItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.attendanceOnly && !canTakeAttendance) return false;
    if (item.minutesOnly && !canManageMinutes) return false;
    return true;
  });

  const showAdminSection = isAdmin || canTakeAttendance || canManageMinutes;

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Member</h3>
      </div>
      {memberNavItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}

      {showAdminSection && (
        <>
          <div className="px-3 py-2 pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isSuperAdmin ? 'General Admin' : isAdmin ? 'Admin' : 'Management'}
            </h3>
          </div>
          {filteredAdminItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <ProfileCompletionDialog />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <div className="flex items-center gap-2 mb-6">
                  <img src={fwcLogo} alt="FWC" className="h-8 w-8" />
                  <span className="font-semibold">FWC Worship Team</span>
                </div>
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <Link to="/dashboard" className="flex items-center gap-2">
              <img src={fwcLogo} alt="FWC" className="h-8 w-8" />
              <span className="font-semibold hidden sm:inline">FWC Worship Team</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile ? getInitials(profile.full_name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{profile?.full_name}</span>
                    <span className="text-xs text-muted-foreground">{profile?.phone}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const event = new CustomEvent('open-onboarding-guide');
                  window.dispatchEvent(event);
                }} className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  App Guide
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex w-64 flex-col border-r bg-card min-h-[calc(100vh-3.5rem)] sticky top-14">
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <NavLinks />
          </div>
        </aside>

        <main className="flex-1 min-h-[calc(100vh-3.5rem)] relative">
          {/* Watermark */}
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.06]"
            aria-hidden="true"
          >
            <img src={fwcWatermark} alt="" className="w-[400px] h-[400px] object-contain" />
          </div>
          <div className="container py-6 relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
