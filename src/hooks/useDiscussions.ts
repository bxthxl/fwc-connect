import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DiscussionTopic {
  id: string;
  title: string;
  body: string;
  created_by: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; avatar_url: string | null } | null;
  reply_count?: number;
}

export interface DiscussionReply {
  id: string;
  topic_id: string;
  body: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; avatar_url: string | null } | null;
}

export function useDiscussionTopics() {
  return useQuery({
    queryKey: ['discussion-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discussion_topics')
        .select('*, profiles!discussion_topics_created_by_fkey(full_name, avatar_url)')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;

      // Get reply counts
      const { data: replyCounts, error: rcError } = await supabase
        .from('discussion_replies')
        .select('topic_id');
      if (rcError) throw rcError;

      const countMap: Record<string, number> = {};
      replyCounts?.forEach((r: any) => {
        countMap[r.topic_id] = (countMap[r.topic_id] || 0) + 1;
      });

      return (data as any[]).map((t) => ({
        ...t,
        reply_count: countMap[t.id] || 0,
      })) as DiscussionTopic[];
    },
  });
}

export function useDiscussionReplies(topicId: string | null) {
  return useQuery({
    queryKey: ['discussion-replies', topicId],
    queryFn: async () => {
      if (!topicId) return [];
      const { data, error } = await supabase
        .from('discussion_replies')
        .select('*, profiles!discussion_replies_created_by_fkey(full_name, avatar_url)')
        .eq('topic_id', topicId)
        .order('created_at');
      if (error) throw error;
      return data as DiscussionReply[];
    },
    enabled: !!topicId,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ title, body }: { title: string; body: string }) => {
      if (!profile) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('discussion_topics')
        .insert({ title, body, created_by: profile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-topics'] });
      toast({ title: 'Topic created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create topic', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ topicId, body }: { topicId: string; body: string }) => {
      if (!profile) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('discussion_replies')
        .insert({ topic_id: topicId, body, created_by: profile.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['discussion-replies', vars.topicId] });
      queryClient.invalidateQueries({ queryKey: ['discussion-topics'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to post reply', description: error.message, variant: 'destructive' });
    },
  });
}

export function useTogglePinTopic() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const { error } = await supabase
        .from('discussion_topics')
        .update({ is_pinned })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-topics'] });
      toast({ title: 'Topic updated' });
    },
  });
}

export function useToggleLockTopic() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_locked }: { id: string; is_locked: boolean }) => {
      const { error } = await supabase
        .from('discussion_topics')
        .update({ is_locked })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-topics'] });
      toast({ title: 'Topic updated' });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('discussion_topics')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion-topics'] });
      toast({ title: 'Topic deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete topic', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteReply() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, topicId }: { id: string; topicId: string }) => {
      const { error } = await supabase
        .from('discussion_replies')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return topicId;
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['discussion-replies', topicId] });
      queryClient.invalidateQueries({ queryKey: ['discussion-topics'] });
      toast({ title: 'Reply deleted' });
    },
  });
}
