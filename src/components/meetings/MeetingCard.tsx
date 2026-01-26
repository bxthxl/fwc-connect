import { Meeting } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';

interface MeetingCardProps {
  meeting: Meeting;
  onClick?: () => void;
}

export function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  const meetingDate = parseISO(meeting.meeting_date);
  const isPastMeeting = isPast(meetingDate) && !isToday(meetingDate);
  const isTodayMeeting = isToday(meetingDate);

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isPastMeeting ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{meeting.title}</CardTitle>
          {isTodayMeeting && (
            <Badge variant="default" className="bg-primary">
              Today
            </Badge>
          )}
          {isPastMeeting && (
            <Badge variant="secondary">Past</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(meetingDate, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{meeting.start_time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{meeting.location}</span>
        </div>
        {meeting.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {meeting.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
