import { useBirthdays } from '@/hooks/useBirthdays';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Cake, PartyPopper, Gift } from 'lucide-react';
import { format, getMonth, getDate } from 'date-fns';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function BirthdayWidget() {
  const { todaysBirthdays, upcomingBirthdays, isLoading } = useBirthdays();

  if (isLoading) return null;

  const hasTodayBirthdays = todaysBirthdays.length > 0;
  const hasUpcoming = upcomingBirthdays.length > 0;

  if (!hasTodayBirthdays && !hasUpcoming) return null;

  return (
    <Card className={hasTodayBirthdays ? 'border-[hsl(var(--accent))]/50 bg-[hsl(var(--accent))]/5' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cake className="h-5 w-5 text-[hsl(var(--accent))]" />
          Birthdays
        </CardTitle>
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
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-semibold text-sm">
                    {getInitials(bm.profile.full_name)}
                  </AvatarFallback>
                </Avatar>
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
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(bm.profile.full_name)}
                  </AvatarFallback>
                </Avatar>
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
