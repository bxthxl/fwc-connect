import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { MeetingDetailsDialog } from '@/components/meetings/MeetingDetailsDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMeetings } from '@/hooks/useMeetings';
import { Meeting } from '@/types/database';
import { Calendar } from 'lucide-react';

export default function MeetingsPage() {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { data: upcomingMeetings, isLoading: upcomingLoading } = useMeetings('upcoming');
  const { data: pastMeetings, isLoading: pastLoading } = useMeetings('past');

  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDialogOpen(true);
  };

  const handleViewMinutes = (minutesId: string) => {
    setDialogOpen(false);
    navigate(`/minutes?id=${minutesId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">View upcoming and past choir meetings</p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingLoading ? (
              <LoadingSpinner />
            ) : upcomingMeetings && upcomingMeetings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onClick={() => handleMeetingClick(meeting)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No upcoming meetings"
                description="There are no meetings scheduled. Check back later!"
              />
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastLoading ? (
              <LoadingSpinner />
            ) : pastMeetings && pastMeetings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pastMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onClick={() => handleMeetingClick(meeting)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No past meetings"
                description="There are no past meetings to display."
              />
            )}
          </TabsContent>
        </Tabs>

        <MeetingDetailsDialog
          meeting={selectedMeeting}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onViewMinutes={handleViewMinutes}
        />
      </div>
    </DashboardLayout>
  );
}
