import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SongCategory } from '@/types/database';

export interface Song {
  id: string;
  title: string;
  artist: string | null;
  lyrics: string | null;
  audio_url: string | null;
  video_url: string | null;
  category: SongCategory | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklySong {
  id: string;
  song_id: string;
  week_start: string;
  song_type: SongCategory;
  notes: string | null;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
  songs?: Song;
}

export interface SongFormData {
  title: string;
  artist?: string;
  lyrics?: string;
  audio_url?: string;
  video_url?: string;
  category?: SongCategory;
}

export interface WeeklySongFormData {
  song_id: string;
  week_start: string;
  song_type: SongCategory;
  notes?: string;
}

// ── Song Bank Hooks ──

export function useSongs(category?: SongCategory) {
  return useQuery({
    queryKey: ['songs', category],
    queryFn: async () => {
      let query = supabase
        .from('songs')
        .select('*')
        .order('title');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Song[];
    },
  });
}

export function useCreateSong() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (song: SongFormData & { created_by?: string }) => {
      const { data, error } = await supabase
        .from('songs')
        .insert(song)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast({ title: 'Song added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add song', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: SongFormData & { id: string }) => {
      const { data: result, error } = await supabase
        .from('songs')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast({ title: 'Song updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update song', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('songs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-songs'] });
      toast({ title: 'Song deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete song', description: error.message, variant: 'destructive' });
    },
  });
}

// ── Weekly Songs Hooks ──

export function useWeeklySongs(weekStart?: string) {
  return useQuery({
    queryKey: ['weekly-songs', weekStart],
    queryFn: async () => {
      let query = supabase
        .from('weekly_songs')
        .select('*, songs(*)')
        .order('week_start', { ascending: false });

      if (weekStart) {
        query = query.eq('week_start', weekStart);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WeeklySong[];
    },
  });
}

export function useCurrentWeekSongs() {
  // Get the Monday of the current week
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const weekStart = monday.toISOString().split('T')[0];

  return useQuery({
    queryKey: ['weekly-songs', 'current', weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_songs')
        .select('*, songs(*)')
        .eq('week_start', weekStart);

      if (error) throw error;
      return data as WeeklySong[];
    },
  });
}

export function useAssignWeeklySong() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: WeeklySongFormData & { assigned_by?: string }) => {
      const { data: result, error } = await supabase
        .from('weekly_songs')
        .upsert(data, { onConflict: 'week_start,song_type' })
        .select('*, songs(*)')
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-songs'] });
      toast({ title: 'Weekly song assigned' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to assign song', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRemoveWeeklySong() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('weekly_songs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-songs'] });
      toast({ title: 'Weekly song removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove song', description: error.message, variant: 'destructive' });
    },
  });
}

// ── Constants ──

export const SONG_CATEGORY_LABELS: Record<SongCategory, string> = {
  praise_worship: 'Praise & Worship',
  friday_special: 'Friday Special',
  sunday_special: 'Sunday Special',
};

export const SONG_CATEGORIES: SongCategory[] = ['praise_worship', 'friday_special', 'sunday_special'];
