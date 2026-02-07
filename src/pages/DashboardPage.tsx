import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceGroupBadge } from '@/components/common/VoiceGroupBadge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { Calendar, FileText, Users, Bell, MapPin, Clock } from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { useMinutes } from '@/hooks/useMinutes';
import { useActiveAnnouncements } from '@/hooks/useAnnouncements';
import { useMembers } from '@/hooks/useMembers';
import { BirthdayWidget } from '@/components/dashboard/BirthdayWidget';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  
  const { data: upcomingMeetings, isLoading: meetingsLoading } = useMeetings('upcoming');
  const { data: publishedMinutes, isLoading: minutesLoading } = useMinutes();
  const { data: activeAnnouncements, isLoading: announcementsLoading } = useActiveAnnouncements();
  const { data: members, isLoading: membersLoading } = useMembers();

  const isLoading = meetingsLoading || minutesLoading || announcementsLoading || (isAdmin && membersLoading);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoader />
      </DashboardLayout>
    );
  }

  const nextMeeting = upcomingMeetings?.[0];
  const upcomingCount = upcomingMeetings?.length ?? 0;
  const minutesCount = publishedMinutes?.length ?? 0;
  const announcementsCount = activeAnnouncements?.length ?? 0;
  const membersCount = members?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            Welcome, {profile?.full_name?.split(' ')[0]}! 👋
          </h1>
          <div className="flex items-center gap-2">
            {profile?.voice_group && <VoiceGroupBadge group={profile.voice_group} />}
            {isAdmin && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Admin</span>}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingCount}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingCount === 1 ? 'Meeting scheduled' : 'Meetings scheduled'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Published Minutes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{minutesCount}</div>
              <p className="text-xs text-muted-foreground">Meeting records available</p>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{membersCount}</div>
                <p className="text-xs text-muted-foreground">Registered worshippers</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcementsCount}</div>
              <p className="text-xs text-muted-foreground">Active announcements</p>
            </CardContent>
          </Card>
        </div>

        {/* Next Meeting Card */}
        <Card>
          <CardHeader>
            <CardTitle>Next Meeting</CardTitle>
            <CardDescription>
              {nextMeeting 
                ? format(new Date(nextMeeting.meeting_date), 'EEEE, MMMM d, yyyy')
                : 'No upcoming meetings scheduled'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nextMeeting ? (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{nextMeeting.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{nextMeeting.start_time.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{nextMeeting.location}</span>
                  </div>
                </div>
                {nextMeeting.description && (
                  <p className="text-sm text-muted-foreground">{nextMeeting.description}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Check back later for upcoming worship team meetings.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Birthday Highlights */}
        <BirthdayWidget />

        {/* Active Announcements */}
        {activeAnnouncements && activeAnnouncements.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Announcements</h2>
            <div className="grid gap-4">
              {activeAnnouncements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{announcement.title}</CardTitle>
                    <CardDescription>
                      {format(new Date(announcement.visible_from), 'MMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{announcement.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
