import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface OnboardingContent {
  id: string;
  key: string;
  title: string;
  body: string;
  sort_order: number;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useOnboardingContent() {
  return useQuery({
    queryKey: ['onboarding-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_content')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as OnboardingContent[];
    },
  });
}

export function useAllOnboardingContent() {
  return useQuery({
    queryKey: ['onboarding-content-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_content')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as OnboardingContent[];
    },
  });
}

export function useUpdateOnboardingContent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, title, body, is_active }: { id: string; title: string; body: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('onboarding_content')
        .update({ title, body, is_active })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-content'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-content-all'] });
      toast({ title: 'Onboarding content updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update content', description: error.message, variant: 'destructive' });
    },
  });
}

export function useMarkOnboardingSeen(onSuccess?: () => void) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('No profile');
      const { error } = await supabase
        .from('profiles')
        .update({ has_seen_onboarding: true })
        .eq('id', profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      onSuccess?.();
    },
  });
}
