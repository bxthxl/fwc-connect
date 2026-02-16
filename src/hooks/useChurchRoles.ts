import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChurchRole {
  id: string;
  name: string;
  created_at: string;
}

export interface MemberChurchRole {
  id: string;
  profile_id: string;
  church_role_id: string;
  created_at: string;
}

export function useChurchRoles() {
  return useQuery({
    queryKey: ['church-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('church_roles')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as ChurchRole[];
    },
  });
}

export function useMemberChurchRoles(profileId?: string) {
  return useQuery({
    queryKey: ['member-church-roles', profileId],
    queryFn: async () => {
      let query = supabase.from('member_church_roles').select('*');
      if (profileId) {
        query = query.eq('profile_id', profileId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as MemberChurchRole[];
    },
    enabled: !!profileId || profileId === undefined,
  });
}

export function useAllMemberChurchRoles() {
  return useQuery({
    queryKey: ['all-member-church-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('member_church_roles').select('*');
      if (error) throw error;
      return data as MemberChurchRole[];
    },
  });
}

export function useSetMemberChurchRoles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ profileId, roleIds }: { profileId: string; roleIds: string[] }) => {
      // Delete existing roles
      await supabase.from('member_church_roles').delete().eq('profile_id', profileId);
      
      // Insert new roles
      if (roleIds.length > 0) {
        const { error } = await supabase.from('member_church_roles').insert(
          roleIds.map(roleId => ({ profile_id: profileId, church_role_id: roleId }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-church-roles'] });
      queryClient.invalidateQueries({ queryKey: ['all-member-church-roles'] });
      toast({ title: 'Church roles updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update church roles', description: error.message, variant: 'destructive' });
    },
  });
}
