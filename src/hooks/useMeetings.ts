import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Meeting } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useMeetings(filter?: 'upcoming' | 'past', branchFilter?: string | null) {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['meetings', filter, branchFilter],
    queryFn: async () => {
      let query = supabase
        .from('meetings')
        .select('*')
        .order('meeting_date', { ascending: filter === 'upcoming' });

      if (filter === 'upcoming') {
        query = query.gte('meeting_date', today);
      } else if (filter === 'past') {
        query = query.lt('meeting_date', today);
      }

      if (branchFilter) {
        query = query.or(`branch_id.eq.${branchFilter},branch_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Meeting[];
    },
  });
}

export function useMeeting(id: string | undefined) {
  return useQuery({
    queryKey: ['meeting', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Meeting | null;
    },
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('meetings')
        .insert(meeting)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({ title: 'Meeting created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create meeting', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...meeting }: Partial<Meeting> & { id: string }) => {
      const { data, error } = await supabase
        .from('meetings')
        .update(meeting)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({ title: 'Meeting updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update meeting', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({ title: 'Meeting deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete meeting', description: error.message, variant: 'destructive' });
    },
  });
}
