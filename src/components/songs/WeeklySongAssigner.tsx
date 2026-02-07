import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Song,
  useWeeklySongs,
  useAssignWeeklySong,
  useRemoveWeeklySong,
  SONG_CATEGORIES,
  SONG_CATEGORY_LABELS,
} from '@/hooks/useSongs';
import { SongCategory } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Music, Plus, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';

interface WeeklySongAssignerProps {
  songs: Song[];
}

export function WeeklySongAssigner({ songs }: WeeklySongAssignerProps) {
  const { profile } = useAuth();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [assigningType, setAssigningType] = useState<SongCategory | null>(null);
  const [selectedSongId, setSelectedSongId] = useState('');
  const [notes, setNotes] = useState('');

  const weekStart = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    const target = currentWeekOffset > 0 ? addWeeks(base, currentWeekOffset) : currentWeekOffset < 0 ? subWeeks(base, -currentWeekOffset) : base;
    return format(target, 'yyyy-MM-dd');
  }, [currentWeekOffset]);

  const weekEnd = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    const target = currentWeekOffset > 0 ? addWeeks(base, currentWeekOffset) : currentWeekOffset < 0 ? subWeeks(base, -currentWeekOffset) : base;
    const end = new Date(target);
    end.setDate(end.getDate() + 6);
    return format(end, 'yyyy-MM-dd');
  }, [currentWeekOffset]);

  const { data: weeklySongs, isLoading } = useWeeklySongs(weekStart);
  const assignSong = useAssignWeeklySong();
  const removeSong = useRemoveWeeklySong();

  const getSongForType = (type: SongCategory) =>
    weeklySongs?.find((ws) => ws.song_type === type);

  const handleAssign = async () => {
    if (!selectedSongId || !assigningType) return;
    await assignSong.mutateAsync({
      song_id: selectedSongId,
      week_start: weekStart,
      song_type: assigningType,
      notes: notes || undefined,
      assigned_by: profile?.id,
    });
    setAssigningType(null);
    setSelectedSongId('');
    setNotes('');
  };

  const handleRemove = async (id: string) => {
    await removeSong.mutateAsync(id);
  };

  return (
    <div className="space-y-4">
      {/* Week Navigator */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCurrentWeekOffset((o) => o - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-semibold">
            Week of {format(new Date(weekStart), 'MMM d')} – {format(new Date(weekEnd), 'MMM d, yyyy')}
          </p>
          {currentWeekOffset === 0 && (
            <Badge variant="secondary" className="text-xs mt-1">Current Week</Badge>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={() => setCurrentWeekOffset((o) => o + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Song Slots */}
      <div className="grid gap-4">
        {SONG_CATEGORIES.map((type) => {
          const assigned = getSongForType(type);
          const song = assigned?.songs;

          return (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {SONG_CATEGORY_LABELS[type]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assigningType === type ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Select Song</Label>
                      <Select value={selectedSongId} onValueChange={setSelectedSongId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a song..." />
                        </SelectTrigger>
                        <SelectContent>
                          {songs.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.title} {s.artist ? `– ${s.artist}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Key of G, start from verse 2..."
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAssign}
                        disabled={!selectedSongId || assignSong.isPending}
                      >
                        {assignSong.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAssigningType(null);
                          setSelectedSongId('');
                          setNotes('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : assigned && song ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Music className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{song.title}</p>
                        {song.artist && (
                          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                        )}
                        {assigned.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{assigned.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAssigningType(type);
                          setSelectedSongId(song.id);
                          setNotes(assigned.notes || '');
                        }}
                      >
                        Change
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(assigned.id)}
                        disabled={removeSong.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                    onClick={() => setAssigningType(type)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Assign Song
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
