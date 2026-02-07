import { useState } from 'react';
import { SongCategory } from '@/types/database';
import { SongFormData, SONG_CATEGORIES, SONG_CATEGORY_LABELS } from '@/hooks/useSongs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SongFormProps {
  initialData?: SongFormData & { id?: string };
  onSubmit: (data: SongFormData) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
}

export function SongForm({ initialData, onSubmit, onCancel, isPending }: SongFormProps) {
  const [formData, setFormData] = useState<SongFormData>({
    title: initialData?.title || '',
    artist: initialData?.artist || '',
    lyrics: initialData?.lyrics || '',
    audio_url: initialData?.audio_url || '',
    video_url: initialData?.video_url || '',
    category: initialData?.category || undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      artist: formData.artist || undefined,
      lyrics: formData.lyrics || undefined,
      audio_url: formData.audio_url || undefined,
      video_url: formData.video_url || undefined,
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{initialData?.id ? 'Edit Song' : 'Add New Song'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Song Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter song title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist / Composer</Label>
              <Input
                id="artist"
                value={formData.artist || ''}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                placeholder="e.g. Sinach, Nathaniel Bassey"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category || 'none'}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value === 'none' ? undefined : (value as SongCategory) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {SONG_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {SONG_CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lyrics">Lyrics</Label>
            <Textarea
              id="lyrics"
              value={formData.lyrics || ''}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              placeholder="Enter song lyrics..."
              className="min-h-[200px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="audio_url">Audio Link</Label>
              <Input
                id="audio_url"
                type="url"
                value={formData.audio_url || ''}
                onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_url">Video Link</Label>
              <Input
                id="video_url"
                type="url"
                value={formData.video_url || ''}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? 'Save Changes' : 'Add Song'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
