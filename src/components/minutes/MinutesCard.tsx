import { MinutesWithMeeting } from '@/hooks/useMinutes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface MinutesCardProps {
  minutes: MinutesWithMeeting;
  onClick?: () => void;
}

export function MinutesCard({ minutes, onClick }: MinutesCardProps) {
  // Strip HTML tags for excerpt
  const plainText = minutes.content.replace(/<[^>]*>/g, '');
  const excerpt = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;

  return (
    <Card className="cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {minutes.meetings.title}
          </CardTitle>
          <Badge variant="secondary">Published</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(parseISO(minutes.meetings.meeting_date), 'MMMM d, yyyy')}</span>
        </div>
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
        )}
      </CardContent>
    </Card>
  );
}
