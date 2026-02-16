import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string;
  dress_code: string | null;
  branch_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventBGV {
  id: string;
  event_id: string;
  member_id: string;
  created_at: string;
}

export function useEvents() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['events', profile?.branch_id],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (profile?.branch_id) {
        query = query.or(`branch_id.eq.${profile.branch_id},branch_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useAllEvents() {
  return useQuery({
    queryKey: ['all-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useEventBGVs(eventId?: string) {
  return useQuery({
    queryKey: ['event-bgvs', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_bgvs')
        .select('*')
        .eq('event_id', eventId!);
      if (error) throw error;
      return data as EventBGV[];
    },
    enabled: !!eventId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'> & { bgv_member_ids?: string[] }) => {
      const { bgv_member_ids, ...eventData } = event;
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();
      if (error) throw error;

      if (bgv_member_ids && bgv_member_ids.length > 0) {
        const { error: bgvError } = await supabase
          .from('event_bgvs')
          .insert(bgv_member_ids.map(mid => ({ event_id: data.id, member_id: mid })));
        if (bgvError) throw bgvError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });
      toast({ title: 'Event created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create event', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, bgv_member_ids, ...eventData }: Partial<Event> & { id: string; bgv_member_ids?: string[] }) => {
      const { error } = await supabase.from('events').update(eventData).eq('id', id);
      if (error) throw error;

      if (bgv_member_ids !== undefined) {
        await supabase.from('event_bgvs').delete().eq('event_id', id);
        if (bgv_member_ids.length > 0) {
          const { error: bgvError } = await supabase
            .from('event_bgvs')
            .insert(bgv_member_ids.map(mid => ({ event_id: id, member_id: mid })));
          if (bgvError) throw bgvError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });
      queryClient.invalidateQueries({ queryKey: ['event-bgvs'] });
      toast({ title: 'Event updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update event', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });
      toast({ title: 'Event deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete event', description: error.message, variant: 'destructive' });
    },
  });
}
