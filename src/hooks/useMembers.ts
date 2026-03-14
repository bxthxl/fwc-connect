import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AppRole, VoiceGroup } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export interface MemberWithRoles extends Profile {
  roles: AppRole[];
}

export function useMembers(voiceGroupFilter?: VoiceGroup) {
  return useQuery({
    queryKey: ['members', voiceGroupFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (voiceGroupFilter) {
        query = query.eq('voice_group', voiceGroupFilter);
      }

      const { data: profiles, error } = await query;
      if (error) throw error;
      return profiles as Profile[];
    },
  });
}

export function useMemberRoles() {
  return useQuery({
    queryKey: ['member-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}

export function useMembersWithRoles(voiceGroupFilter?: VoiceGroup) {
  const { data: members, isLoading: membersLoading, error: membersError } = useMembers(voiceGroupFilter);
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useMemberRoles();

  const membersWithRoles: MemberWithRoles[] = (members || []).map((member) => ({
    ...member,
    roles: (roles || [])
      .filter((r) => r.user_id === member.id)
      .map((r) => r.role as AppRole),
  }));

  return {
    data: membersWithRoles,
    isLoading: membersLoading || rolesLoading,
    error: membersError || rolesError,
  };
}

export function useAddRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role as any })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-roles'] });
      toast({ title: 'Role added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add role', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-roles'] });
      toast({ title: 'Role removed successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove role', description: error.message, variant: 'destructive' });
    },
  });
}
