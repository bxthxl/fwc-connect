import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMembers } from '@/hooks/useMembers';
import { useMeetings } from '@/hooks/useMeetings';
import { useMinutes } from '@/hooks/useMinutes';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Users,
  Calendar,
  FileText,
  Megaphone,
  Plus,
  ClipboardCheck,
  ArrowRight,
  UserX,
  Mail,
} from 'lucide-react';

interface IncompleteUser {
  id: string;
  email: string;
  created_at: string;
}

function useIncompleteRegistrations(enabled: boolean) {
  return useQuery({
    queryKey: ['incomplete-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('list-incomplete-registrations');
      if (error) throw error;
      return data as IncompleteUser[];
    },
    enabled,
  });
}

export default function AdminOverviewPage() {
  const { isSuperAdmin } = useAuth();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: incompleteUsers, isLoading: incompleteLoading } = useIncompleteRegistrations(isSuperAdmin);
  const { data: upcomingMeetings, isLoading: meetingsLoading } = useMeetings('upcoming');
  const { data: minutes, isLoading: minutesLoading } = useMinutes(true);
  const { data: announcements, isLoading: announcementsLoading } = useAnnouncements(true);

  const isLoading = membersLoading || meetingsLoading || minutesLoading || announcementsLoading;
  
  const unpublishedMinutes = minutes?.filter((m) => !m.is_published).length || 0;
  const activeAnnouncements = announcements?.filter((a) => {
    const now = new Date();
    return new Date(a.visible_from) <= now && new Date(a.visible_to) >= now;
  }).length || 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your choir and members</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Members"
            value={members?.length || 0}
            icon={Users}
            description="Registered choir members"
          />
          <StatsCard
            title="Upcoming Meetings"
            value={upcomingMeetings?.length || 0}
            icon={Calendar}
            description="Scheduled rehearsals"
          />
          <StatsCard
            title="Pending Minutes"
            value={unpublishedMinutes}
            icon={FileText}
            description="Drafts to publish"
          />
          <StatsCard
            title="Active Announcements"
            value={activeAnnouncements}
            icon={Megaphone}
            description="Currently visible"
          />
        </div>

        {/* Incomplete Registrations - Super Admin Only */}
        {isSuperAdmin && (
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">Incomplete Registrations</CardTitle>
                {incompleteUsers && incompleteUsers.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {incompleteUsers.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {incompleteLoading ? (
                <LoadingSpinner />
              ) : !incompleteUsers || incompleteUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">All registered users have completed their profiles. 🎉</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    These users signed up but haven't completed their profile onboarding.
                  </p>
                  <div className="divide-y rounded-md border">
                    {incompleteUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                            <Mail className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Signed up {format(new Date(user.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button asChild variant="outline" className="h-auto py-4 flex-col">
                <Link to="/admin/meetings">
                  <Plus className="h-5 w-5 mb-2" />
                  Create Meeting
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col">
                <Link to="/admin/attendance">
                  <ClipboardCheck className="h-5 w-5 mb-2" />
                  Mark Attendance
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col">
                <Link to="/admin/minutes">
                  <FileText className="h-5 w-5 mb-2" />
                  Manage Minutes
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col">
                <Link to="/admin/announcements">
                  <Megaphone className="h-5 w-5 mb-2" />
                  Post Announcement
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <Link to="/admin/members">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Members</CardTitle>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View all {members?.length || 0} members, manage roles and permissions
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <Link to="/admin/meetings">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Meetings</CardTitle>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Schedule and manage choir rehearsals and events
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
