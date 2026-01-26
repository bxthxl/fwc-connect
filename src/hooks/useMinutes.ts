import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Minutes, Meeting } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export interface MinutesWithMeeting extends Minutes {
  meetings: Pick<Meeting, 'id' | 'title' | 'meeting_date'>;
}

export function useMinutes(includeUnpublished = false) {
  return useQuery({
    queryKey: ['minutes', includeUnpublished],
    queryFn: async () => {
      let query = supabase
        .from('minutes')
        .select(`
          *,
          meetings:meeting_id (id, title, meeting_date)
        `)
        .order('created_at', { ascending: false });

      if (!includeUnpublished) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MinutesWithMeeting[];
    },
  });
}

export function useMinutesById(id: string | undefined) {
  return useQuery({
    queryKey: ['minutes', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('minutes')
        .select(`
          *,
          meetings:meeting_id (id, title, meeting_date)
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as MinutesWithMeeting | null;
    },
    enabled: !!id,
  });
}

export function useMinutesByMeeting(meetingId: string | undefined) {
  return useQuery({
    queryKey: ['minutes', 'meeting', meetingId],
    queryFn: async () => {
      if (!meetingId) return null;
      const { data, error } = await supabase
        .from('minutes')
        .select('*')
        .eq('meeting_id', meetingId)
        .maybeSingle();
      if (error) throw error;
      return data as Minutes | null;
    },
    enabled: !!meetingId,
  });
}

export function useCreateMinutes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (minutes: { meeting_id: string; content: string; is_published?: boolean }) => {
      const { data, error } = await supabase
        .from('minutes')
        .insert(minutes)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minutes'] });
      toast({ title: 'Minutes created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create minutes', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateMinutes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...minutes }: Partial<Minutes> & { id: string }) => {
      const { data, error } = await supabase
        .from('minutes')
        .update(minutes)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minutes'] });
      toast({ title: 'Minutes updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update minutes', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteMinutes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('minutes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minutes'] });
      toast({ title: 'Minutes deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete minutes', description: error.message, variant: 'destructive' });
    },
  });
}
