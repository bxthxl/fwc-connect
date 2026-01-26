import { MinutesWithMeeting } from '@/hooks/useMinutes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MinutesViewerProps {
  minutes: MinutesWithMeeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MinutesViewer({ minutes, open, onOpenChange }: MinutesViewerProps) {
  if (!minutes) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{minutes.meetings.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(minutes.meetings.meeting_date), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            <Badge variant="secondary">Published</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div
            className="rich-text-content prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: minutes.content }}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
