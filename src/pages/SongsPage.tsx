import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { SongViewer } from '@/components/songs/SongViewer';
import {
  useCurrentWeekSongs,
  useSongs,
  Song,
  SONG_CATEGORIES,
  SONG_CATEGORY_LABELS,
} from '@/hooks/useSongs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, ExternalLink, Video, Search } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';

export default function SongsPage() {
  const { data: weeklySongs, isLoading: weeklyLoading } = useCurrentWeekSongs();
  const { data: allSongs, isLoading: songsLoading } = useSongs();
  const [viewingSong, setViewingSong] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isLoading = weeklyLoading || songsLoading;

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const filteredSongs = (allSongs || []).filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.artist && s.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        <div>
          <h1 className="text-3xl font-bold">Songs</h1>
          <p className="text-muted-foreground">This week's songs and the worship song bank</p>
        </div>

        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="bank">Song Bank</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              {format(monday, 'MMM d')} – {format(sunday, 'MMM d, yyyy')}
            </p>

            {(!weeklySongs || weeklySongs.length === 0) ? (
              <EmptyState
                icon={Music}
                title="No songs assigned this week"
                description="Check back later for this week's worship songs."
              />
            ) : (
              <div className="grid gap-4">
                {SONG_CATEGORIES.map((type) => {
                  const assignment = weeklySongs.find((ws) => ws.song_type === type);
                  const song = assignment?.songs;

                  if (!assignment || !song) return null;

                  return (
                    <Card
                      key={type}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => setViewingSong(song)}
                    >
                      <CardHeader className="pb-2">
                        <Badge variant="secondary" className="w-fit text-xs mb-1">
                          {SONG_CATEGORY_LABELS[type]}
                        </Badge>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Music className="h-5 w-5 text-primary" />
                          {song.title}
                        </CardTitle>
                        {song.artist && (
                          <CardDescription>{song.artist}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {assignment.notes && (
                            <p className="text-sm text-muted-foreground italic w-full mb-2">
                              {assignment.notes}
                            </p>
                          )}
                          {song.audio_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a href={song.audio_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" /> Listen
                              </a>
                            </Button>
                          )}
                          {song.video_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a href={song.video_url} target="_blank" rel="noopener noreferrer">
                                <Video className="h-3 w-3 mr-1" /> Watch
                              </a>
                            </Button>
                          )}
                          {song.lyrics && (
                            <Badge variant="outline" className="text-xs">
                              Tap to view lyrics
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bank" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredSongs.length === 0 ? (
              <EmptyState
                icon={Music}
                title="No songs found"
                description={searchQuery ? 'Try a different search term.' : 'The song bank is empty.'}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredSongs.map((song) => (
                  <Card
                    key={song.id}
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => setViewingSong(song)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Music className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{song.title}</p>
                          {song.artist && (
                            <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {song.category && (
                              <Badge variant="secondary" className="text-xs">
                                {SONG_CATEGORY_LABELS[song.category]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Song Viewer */}
        <SongViewer
          song={viewingSong}
          open={!!viewingSong}
          onClose={() => setViewingSong(null)}
        />
      </div>
    </DashboardLayout>
  );
}
