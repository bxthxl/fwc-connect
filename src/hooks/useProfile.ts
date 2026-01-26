import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useUpdateProfile() {
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async (profile: Partial<Profile> & { id: string }) => {
      const { id, ...updateData } = profile;
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await refreshProfile();
      toast({ title: 'Profile updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update profile', description: error.message, variant: 'destructive' });
    },
  });
}

export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Password changed successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to change password', description: error.message, variant: 'destructive' });
    },
  });
}
