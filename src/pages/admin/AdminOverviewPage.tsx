import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMembers } from '@/hooks/useMembers';
import { useMeetings } from '@/hooks/useMeetings';
import { useMinutes } from '@/hooks/useMinutes';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Users,
  Calendar,
  FileText,
  Megaphone,
  Plus,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { data: members, isLoading: membersLoading } = useMembers();
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
