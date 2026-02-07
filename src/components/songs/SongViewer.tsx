import { Song, SONG_CATEGORY_LABELS } from '@/hooks/useSongs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Music, ExternalLink, Video, X } from 'lucide-react';

interface SongViewerProps {
  song: Song | null;
  open: boolean;
  onClose: () => void;
}

export function SongViewer({ song, open, onClose }: SongViewerProps) {
  if (!song) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            {song.title}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {song.artist && (
              <span className="text-sm text-muted-foreground">by {song.artist}</span>
            )}
            {song.category && (
              <Badge variant="secondary" className="text-xs">
                {SONG_CATEGORY_LABELS[song.category]}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Links */}
            {(song.audio_url || song.video_url) && (
              <div className="flex flex-wrap gap-2">
                {song.audio_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={song.audio_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Listen
                    </a>
                  </Button>
                )}
                {song.video_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={song.video_url} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-1" />
                      Watch
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Lyrics */}
            {song.lyrics ? (
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Lyrics
                </h3>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {song.lyrics}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No lyrics available.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
