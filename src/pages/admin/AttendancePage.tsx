import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceMarker } from '@/components/admin/AttendanceMarker';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { VoiceGroupBadge } from '@/components/common/VoiceGroupBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMeetings } from '@/hooks/useMeetings';
import { useMembers } from '@/hooks/useMembers';
import { useAttendanceByMeeting, useMarkAttendance, useBulkMarkAttendance } from '@/hooks/useAttendance';
import { Profile, VoiceGroup, VOICE_GROUPS, VOICE_GROUP_LABELS, AttendanceStatus } from '@/types/database';
import { ClipboardCheck, Users, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AttendancePage() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');

  const { data: meetings, isLoading: meetingsLoading } = useMeetings();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { data: attendance, isLoading: attendanceLoading } = useAttendanceByMeeting(
    selectedMeetingId || undefined
  );
  const markAttendance = useMarkAttendance();
  const bulkMarkAttendance = useBulkMarkAttendance();

  const selectedMeeting = meetings?.find((m) => m.id === selectedMeetingId);

  const handleStatusChange = async (userId: string, status: AttendanceStatus) => {
    if (!selectedMeetingId) return;
    await markAttendance.mutateAsync({
      meetingId: selectedMeetingId,
      userId,
      status,
    });
  };

  const handleMarkAllPresent = async (userIds: string[]) => {
    if (!selectedMeetingId) return;
    await bulkMarkAttendance.mutateAsync({
      meetingId: selectedMeetingId,
      userIds,
      status: 'present',
    });
  };

  const getMemberStatus = (memberId: string): AttendanceStatus | undefined => {
    return attendance?.find((a) => a.user_id === memberId)?.status;
  };

  const groupedMembers = VOICE_GROUPS.reduce((acc, group) => {
    acc[group] = members?.filter((m) => m.voice_group === group) || [];
    return acc;
  }, {} as Record<VoiceGroup, Profile[]>);

  const isLoading = meetingsLoading || membersLoading || attendanceLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Mark attendance for choir meetings</p>
        </div>

        {/* Meeting Selector */}
        <div className="max-w-md">
          <Select value={selectedMeetingId} onValueChange={setSelectedMeetingId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a meeting" />
            </SelectTrigger>
            <SelectContent>
              {meetings?.map((meeting) => (
                <SelectItem key={meeting.id} value={meeting.id}>
                  {meeting.title} - {format(parseISO(meeting.meeting_date), 'MMM d, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedMeetingId ? (
          <EmptyState
            icon={ClipboardCheck}
            title="Select a meeting"
            description="Choose a meeting from the dropdown to mark attendance"
          />
        ) : isLoading ? (
          <LoadingSpinner />
        ) : !members || members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members found"
            description="There are no members to mark attendance for"
          />
        ) : (
          <div className="space-y-6">
            {selectedMeeting && (
              <div className="text-sm text-muted-foreground">
                Marking attendance for: <span className="font-medium text-foreground">{selectedMeeting.title}</span>
                {' - '}{format(parseISO(selectedMeeting.meeting_date), 'EEEE, MMMM d, yyyy')}
              </div>
            )}

            {VOICE_GROUPS.map((group) => {
              const groupMembers = groupedMembers[group];
              if (groupMembers.length === 0) return null;

              return (
                <Card key={group}>
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <CardTitle className="flex items-center gap-2">
                      <VoiceGroupBadge group={group} />
                      <span className="text-sm text-muted-foreground">
                        ({groupMembers.length} members)
                      </span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAllPresent(groupMembers.map((m) => m.id))}
                      disabled={bulkMarkAttendance.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark All Present
                    </Button>
                  </CardHeader>
                  <CardContent className="divide-y">
                    {groupMembers.map((member) => (
                      <AttendanceMarker
                        key={member.id}
                        member={member}
                        currentStatus={getMemberStatus(member.id)}
                        onStatusChange={(status) => handleStatusChange(member.id, status)}
                        isLoading={markAttendance.isPending}
                      />
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
