import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { VoiceGroupBadge } from '@/components/common/VoiceGroupBadge';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useMembers } from '@/hooks/useMembers';
import { Profile, VoiceGroup, VOICE_GROUP_LABELS } from '@/types/database';
import { Shuffle, Users, RefreshCw, Search, UserCheck } from 'lucide-react';

const VOCAL_GROUPS: VoiceGroup[] = ['soprano', 'alto', 'tenor', 'bass'];

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export default function BGVSelectorPage() {
  const { data: members, isLoading } = useMembers();
  const [mode, setMode] = useState<'random' | 'manual'>('random');
  
  // Random mode state
  const [selectedGroups, setSelectedGroups] = useState<VoiceGroup[]>(['soprano', 'alto', 'tenor', 'bass']);
  const [count, setCount] = useState(3);
  const [results, setResults] = useState<Profile[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Manual mode state
  const [manualSelected, setManualSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const eligibleMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((m) => selectedGroups.includes(m.voice_group));
  }, [members, selectedGroups]);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter(m =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      VOICE_GROUP_LABELS[m.voice_group].toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const toggleGroup = (group: VoiceGroup) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const generate = () => {
    const picked = shuffleAndPick(eligibleMembers, Math.min(count, eligibleMembers.length));
    setResults(picked);
    setHasGenerated(true);
  };

  const toggleManual = (id: string) => {
    setManualSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const manualResults = useMemo(() => {
    if (!members) return [];
    return members.filter(m => manualSelected.includes(m.id));
  }, [members, manualSelected]);

  const displayResults = mode === 'random' ? results : manualResults;
  const showResults = mode === 'random' ? hasGenerated : manualSelected.length > 0;

  if (isLoading) {
    return <DashboardLayout><PageLoader /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shuffle className="h-8 w-8 text-primary" />
            BGV Selector
          </h1>
          <p className="text-muted-foreground">Select backup vocalists randomly or manually</p>
        </div>

        <Tabs value={mode} onValueChange={v => setMode(v as 'random' | 'manual')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="random"><Shuffle className="h-4 w-4 mr-2" />Random</TabsTrigger>
            <TabsTrigger value="manual"><UserCheck className="h-4 w-4 mr-2" />Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="random">
            <Card>
              <CardHeader><CardTitle className="text-base">Selection Criteria</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Voice Groups</Label>
                  <div className="flex flex-wrap gap-4">
                    {VOCAL_GROUPS.map((group) => (
                      <div key={group} className="flex items-center gap-2">
                        <Checkbox id={`group-${group}`} checked={selectedGroups.includes(group)} onCheckedChange={() => toggleGroup(group)} />
                        <Label htmlFor={`group-${group}`} className="text-sm cursor-pointer">{VOICE_GROUP_LABELS[group]}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bgv-count" className="text-sm font-medium">Number of BGVs</Label>
                  <Input id="bgv-count" type="number" min={1} max={eligibleMembers.length || 10} value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)} className="w-32" />
                  <p className="text-xs text-muted-foreground">{eligibleMembers.length} eligible member{eligibleMembers.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={generate} disabled={selectedGroups.length === 0}>
                    <Shuffle className="h-4 w-4 mr-2" />{hasGenerated ? 'Regenerate' : 'Generate'}
                  </Button>
                  {hasGenerated && <Button variant="outline" onClick={generate}><RefreshCw className="h-4 w-4 mr-2" />Shuffle Again</Button>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card>
              <CardHeader><CardTitle className="text-base">Pick Members Manually</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                </div>
                <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
                  {filteredMembers.map(m => (
                    <label key={m.id} className="flex items-center gap-3 p-2.5 hover:bg-muted cursor-pointer">
                      <Checkbox checked={manualSelected.includes(m.id)} onCheckedChange={() => toggleManual(m.id)} />
                      <MemberAvatar profile={m} size="sm" />
                      <span className="text-sm flex-1 truncate">{m.full_name}</span>
                      <VoiceGroupBadge group={m.voice_group} size="sm" />
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{manualSelected.length} member(s) selected</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showResults && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5" />
                Selected BGVs ({displayResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayResults.length === 0 ? (
                <EmptyState icon={Users} title="No members found" description="No members match the selected criteria." />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {displayResults.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 rounded-lg border p-3 bg-card">
                      <MemberAvatar profile={member} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{member.full_name}</p>
                        <VoiceGroupBadge group={member.voice_group} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
