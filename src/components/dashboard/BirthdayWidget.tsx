import { useBirthdays } from '@/hooks/useBirthdays';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { Cake, PartyPopper, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export function BirthdayWidget() {
  const { todaysBirthdays, upcomingBirthdays, isLoading } = useBirthdays();

  if (isLoading) return null;

  const hasTodayBirthdays = todaysBirthdays.length > 0;
  const hasUpcoming = upcomingBirthdays.length > 0;

  if (!hasTodayBirthdays && !hasUpcoming) return null;

  return (
    <Card className={hasTodayBirthdays ? 'border-[hsl(var(--accent))]/50 bg-[hsl(var(--accent))]/5' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cake className="h-5 w-5 text-[hsl(var(--accent))]" />
            Birthdays
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/birthdays">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Birthdays */}
        {hasTodayBirthdays && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--accent))]">
              <PartyPopper className="h-4 w-4" />
              Today's Celebrations!
            </div>
            {todaysBirthdays.map((bm) => (
              <div
                key={bm.profile.id}
                className="flex items-center gap-3 rounded-lg bg-[hsl(var(--accent))]/10 p-3"
              >
                <MemberAvatar profile={bm.profile} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{bm.profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">🎉 Happy Birthday!</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Birthdays */}
        {hasUpcoming && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
            {upcomingBirthdays.map((bm) => (
              <div
                key={bm.profile.id}
                className="flex items-center gap-3 py-1.5"
              >
                <MemberAvatar profile={bm.profile} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{bm.profile.full_name}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Gift className="h-3 w-3" />
                  {format(bm.nextBirthday, 'MMM d')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
