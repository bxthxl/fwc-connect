import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
} from 'lucide-react';
import fwcLogo from '@/assets/fwc-logo.png';

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
  { label: 'Minutes', href: '/minutes', icon: FileText },
  { label: 'Profile', href: '/profile', icon: User },
];

const adminNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: Shield, adminOnly: true },
  { label: 'Members', href: '/admin/members', icon: Users, adminOnly: true },
  { label: 'Meetings', href: '/admin/meetings', icon: Calendar, adminOnly: true },
  { label: 'Attendance', href: '/admin/attendance', icon: ClipboardCheck, attendanceOnly: true },
  { label: 'Minutes', href: '/admin/minutes', icon: PenTool, minutesOnly: true },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone, adminOnly: true },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, isAdmin, canTakeAttendance, canManageMinutes, signOut } = useAuth();
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
      {/* Member Navigation */}
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

      {/* Admin Navigation */}
      {showAdminSection && (
        <>
          <div className="px-3 py-2 pt-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isAdmin ? 'Admin' : 'Management'}
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-14 items-center justify-between">
          {/* Mobile menu trigger */}
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
                  <span className="font-semibold">FWC Worshippers</span>
                </div>
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src={fwcLogo} alt="FWC" className="h-8 w-8" />
              <span className="font-semibold hidden sm:inline">FWC Worshippers</span>
            </Link>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
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
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-card min-h-[calc(100vh-3.5rem)] sticky top-14">
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <NavLinks />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)]">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
