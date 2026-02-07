import { Song, SONG_CATEGORY_LABELS } from '@/hooks/useSongs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Pencil, Trash2, ExternalLink, Video } from 'lucide-react';

interface SongCardProps {
  song: Song;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  showActions?: boolean;
}

export function SongCard({ song, onEdit, onDelete, onClick, showActions = false }: SongCardProps) {
  return (
    <Card
      className={onClick ? 'cursor-pointer transition-all hover:shadow-md' : ''}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{song.title}</CardTitle>
              {song.artist && (
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              )}
            </div>
          </div>
          {showActions && (
            <div className="flex gap-1 shrink-0">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          {song.category && (
            <Badge variant="secondary" className="text-xs">
              {SONG_CATEGORY_LABELS[song.category]}
            </Badge>
          )}
          {song.audio_url && (
            <Badge variant="outline" className="text-xs gap-1">
              <ExternalLink className="h-3 w-3" /> Audio
            </Badge>
          )}
          {song.video_url && (
            <Badge variant="outline" className="text-xs gap-1">
              <Video className="h-3 w-3" /> Video
            </Badge>
          )}
          {song.lyrics && (
            <Badge variant="outline" className="text-xs">
              Lyrics
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
