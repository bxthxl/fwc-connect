import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Announcement } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useAnnouncements(includeAll = false) {
  return useQuery({
    queryKey: ['announcements', includeAll],
    queryFn: async () => {
      let query = supabase
        .from('announcements')
        .select('*')
        .order('visible_from', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

export function useActiveAnnouncements() {
  return useQuery({
    queryKey: ['announcements', 'active'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .lte('visible_from', now)
        .gte('visible_to', now)
        .order('visible_from', { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert(announcement)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'Announcement created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create announcement', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...announcement }: Partial<Announcement> & { id: string }) => {
      const { data, error } = await supabase
        .from('announcements')
        .update(announcement)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'Announcement updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update announcement', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({ title: 'Announcement deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete announcement', description: error.message, variant: 'destructive' });
    },
  });
}

export function getAnnouncementStatus(announcement: Announcement): 'active' | 'scheduled' | 'expired' {
  const now = new Date();
  const from = new Date(announcement.visible_from);
  const to = new Date(announcement.visible_to);

  if (now < from) return 'scheduled';
  if (now > to) return 'expired';
  return 'active';
}
