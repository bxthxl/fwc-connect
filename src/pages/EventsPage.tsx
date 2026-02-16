import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { useEvents, useEventBGVs } from '@/hooks/useEvents';
import { useMembers } from '@/hooks/useMembers';
import { CalendarDays, Clock, MapPin, Shirt, Users } from 'lucide-react';
import { format, parseISO, isFuture, isToday } from 'date-fns';
import { Profile } from '@/types/database';

function EventBGVList({ eventId, members }: { eventId: string; members: Profile[] }) {
  const { data: bgvs } = useEventBGVs(eventId);
  if (!bgvs || bgvs.length === 0) return null;
  
  const bgvMembers = bgvs
    .map(b => members.find(m => m.id === b.member_id))
    .filter(Boolean) as Profile[];

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Backup Vocalists
      </p>
      <div className="flex flex-wrap gap-2">
        {bgvMembers.map(m => (
          <div key={m.id} className="flex items-center gap-1.5 text-sm bg-muted rounded-full px-2 py-1">
            <MemberAvatar profile={m} size="sm" />
            <span className="truncate max-w-[120px]">{m.full_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { data: events, isLoading } = useEvents();
  const { data: members } = useMembers();

  if (isLoading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  const upcomingEvents = (events || []).filter(e => isFuture(parseISO(e.event_date)) || isToday(parseISO(e.event_date)));
  const pastEvents = (events || []).filter(e => !isFuture(parseISO(e.event_date)) && !isToday(parseISO(e.event_date)));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Events
          </h1>
          <p className="text-muted-foreground">Upcoming events and activities</p>
        </div>

        {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events yet" description="Events will appear here when they are created." />
        ) : (
          <>
            {upcomingEvents.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Upcoming</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingEvents.map(event => (
                    <Card key={event.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          {isToday(parseISO(event.event_date)) && <Badge variant="default">Today</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {event.description && <p className="text-muted-foreground">{event.description}</p>}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>{format(parseISO(event.event_date), 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        {event.dress_code && (
                          <div className="flex items-center gap-2">
                            <Shirt className="h-4 w-4 text-primary" />
                            <span className="font-medium">Dress Code: {event.dress_code}</span>
                          </div>
                        )}
                        {members && <EventBGVList eventId={event.id} members={members} />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-muted-foreground">Past Events</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {pastEvents.slice(0, 6).map(event => (
                    <Card key={event.id} className="opacity-60">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>{format(parseISO(event.event_date), 'MMMM d, yyyy')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
