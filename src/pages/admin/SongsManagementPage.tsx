import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { SongForm } from '@/components/songs/SongForm';
import { SongCard } from '@/components/songs/SongCard';
import { SongViewer } from '@/components/songs/SongViewer';
import { WeeklySongAssigner } from '@/components/songs/WeeklySongAssigner';
import {
  useSongs,
  useCreateSong,
  useUpdateSong,
  useDeleteSong,
  Song,
  SongFormData,
  SONG_CATEGORIES,
  SONG_CATEGORY_LABELS,
} from '@/hooks/useSongs';
import { SongCategory } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Music } from 'lucide-react';

export default function SongsManagementPage() {
  const { profile } = useAuth();
  const { data: songs, isLoading } = useSongs();
  const createSong = useCreateSong();
  const updateSong = useUpdateSong();
  const deleteSong = useDeleteSong();

  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [viewingSong, setViewingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = async (data: SongFormData) => {
    await createSong.mutateAsync({ ...data, created_by: profile?.id });
    setShowForm(false);
  };

  const handleUpdate = async (data: SongFormData) => {
    if (!editingSong) return;
    await updateSong.mutateAsync({ id: editingSong.id, ...data });
    setEditingSong(null);
  };

  const handleDelete = async () => {
    if (!deletingSong) return;
    await deleteSong.mutateAsync(deletingSong.id);
    setDeletingSong(null);
  };

  const filteredSongs = (songs || []).filter(
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Songs Management</h1>
            <p className="text-muted-foreground">Manage the song bank and weekly song assignments</p>
          </div>
          {!showForm && !editingSong && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Song
            </Button>
          )}
        </div>

        <Tabs defaultValue="bank">
          <TabsList>
            <TabsTrigger value="bank">Song Bank</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Songs</TabsTrigger>
          </TabsList>

          <TabsContent value="bank" className="space-y-4 mt-4">
            {showForm && (
              <SongForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
                isPending={createSong.isPending}
              />
            )}

            {editingSong && (
              <SongForm
                initialData={{
                  id: editingSong.id,
                  title: editingSong.title,
                  artist: editingSong.artist || '',
                  lyrics: editingSong.lyrics || '',
                  audio_url: editingSong.audio_url || '',
                  video_url: editingSong.video_url || '',
                  category: editingSong.category || undefined,
                }}
                onSubmit={handleUpdate}
                onCancel={() => setEditingSong(null)}
                isPending={updateSong.isPending}
              />
            )}

            {!showForm && !editingSong && (
              <>
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
                    title="No songs yet"
                    description="Add songs to your worship team's song bank."
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSongs.map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        showActions
                        onClick={() => setViewingSong(song)}
                        onEdit={() => setEditingSong(song)}
                        onDelete={() => setDeletingSong(song)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <WeeklySongAssigner songs={songs || []} />
          </TabsContent>
        </Tabs>

        {/* Song Viewer Dialog */}
        <SongViewer
          song={viewingSong}
          open={!!viewingSong}
          onClose={() => setViewingSong(null)}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingSong} onOpenChange={(o) => !o && setDeletingSong(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{deletingSong?.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this song and remove it from any weekly assignments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
