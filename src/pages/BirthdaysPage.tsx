import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { VoiceGroupBadge } from '@/components/common/VoiceGroupBadge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useMembers } from '@/hooks/useMembers';
import { useAuth } from '@/contexts/AuthContext';
import { Cake, Download } from 'lucide-react';
import { format, getMonth, getDate } from 'date-fns';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BirthdaysPage() {
  const { isAdmin } = useAuth();
  const { data: members, isLoading } = useMembers();
  const currentMonth = new Date().getMonth();
  const [activeTab, setActiveTab] = useState(String(currentMonth));

  const membersByMonth = useMemo(() => {
    if (!members) return {};
    const grouped: Record<number, typeof members> = {};
    for (let i = 0; i < 12; i++) grouped[i] = [];
    members.forEach((m) => {
      const month = getMonth(new Date(m.birthday));
      grouped[month].push(m);
    });
    // Sort each month by day
    Object.values(grouped).forEach((list) =>
      list.sort((a, b) => getDate(new Date(a.birthday)) - getDate(new Date(b.birthday)))
    );
    return grouped;
  }, [members]);

  const downloadCSV = () => {
    const monthIdx = parseInt(activeTab);
    const monthMembers = membersByMonth[monthIdx] || [];
    if (!monthMembers.length) return;

    const header = 'Name,Birthday,Voice Group,Phone,Email\n';
    const rows = monthMembers
      .map((m) =>
        `"${m.full_name}","${format(new Date(m.birthday), 'MMMM d')}","${m.voice_group}","${m.phone || ''}","${m.email}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `birthdays-${MONTHS[monthIdx].toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Cake className="h-8 w-8 text-[hsl(var(--accent))]" />
              Birthday Calendar
            </h1>
            <p className="text-muted-foreground">Celebrate your worship team family</p>
          </div>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {MONTHS.map((month, idx) => (
              <TabsTrigger key={idx} value={String(idx)} className="text-xs px-3 py-1.5">
                {month.slice(0, 3)}
                {(membersByMonth[idx]?.length ?? 0) > 0 && (
                  <span className="ml-1 text-[10px] bg-primary/10 text-primary rounded-full px-1.5">
                    {membersByMonth[idx]?.length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {MONTHS.map((month, idx) => (
            <TabsContent key={idx} value={String(idx)}>
              <Card>
                <CardHeader>
                  <CardTitle>{month} Birthdays</CardTitle>
                </CardHeader>
                <CardContent>
                  {(membersByMonth[idx]?.length ?? 0) === 0 ? (
                    <EmptyState
                      icon={Cake}
                      title="No birthdays this month"
                      description={`No worship team members have birthdays in ${month}.`}
                    />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {membersByMonth[idx]?.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <MemberAvatar profile={member} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{member.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(member.birthday), 'MMMM d')}
                            </p>
                            <VoiceGroupBadge group={member.voice_group} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
