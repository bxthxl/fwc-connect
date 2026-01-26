import { Meeting } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { useMinutesByMeeting } from '@/hooks/useMinutes';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface MeetingDetailsDialogProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewMinutes?: (minutesId: string) => void;
}

export function MeetingDetailsDialog({
  meeting,
  open,
  onOpenChange,
  onViewMinutes,
}: MeetingDetailsDialogProps) {
  const { data: minutes, isLoading: minutesLoading } = useMinutesByMeeting(meeting?.id);

  if (!meeting) return null;

  const meetingDate = parseISO(meeting.meeting_date);
  const isPastMeeting = isPast(meetingDate) && !isToday(meetingDate);
  const isTodayMeeting = isToday(meetingDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-2">
            <DialogTitle className="text-xl">{meeting.title}</DialogTitle>
            {isTodayMeeting && (
              <Badge variant="default" className="bg-primary">
                Today
              </Badge>
            )}
            {isPastMeeting && <Badge variant="secondary">Past</Badge>}
          </div>
          <DialogDescription>Meeting details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(meetingDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{meeting.start_time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{meeting.location}</span>
          </div>

          {meeting.description && (
            <div className="pt-2 border-t">
              <p className="text-sm">{meeting.description}</p>
            </div>
          )}

          {/* Minutes section */}
          {isPastMeeting && (
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Meeting Minutes
              </h4>
              {minutesLoading ? (
                <LoadingSpinner />
              ) : minutes && minutes.is_published ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewMinutes?.(minutes.id)}
                >
                  View Minutes
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Minutes not yet published
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
