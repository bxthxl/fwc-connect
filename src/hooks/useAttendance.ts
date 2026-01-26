import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Attendance, AttendanceStatus, Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface AttendanceWithMember extends Attendance {
  profiles: Pick<Profile, 'id' | 'full_name' | 'voice_group'>;
}

export function useAttendanceByMeeting(meetingId: string | undefined) {
  return useQuery({
    queryKey: ['attendance', meetingId],
    queryFn: async () => {
      if (!meetingId) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles!attendance_user_id_fkey (id, full_name, voice_group)
        `)
        .eq('meeting_id', meetingId);
      if (error) throw error;
      return data as AttendanceWithMember[];
    },
    enabled: !!meetingId,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      meetingId,
      userId,
      status,
      notes,
    }: {
      meetingId: string;
      userId: string;
      status: AttendanceStatus;
      notes?: string;
    }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('meeting_id', meetingId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('attendance')
          .update({
            status,
            notes,
            marked_by: profile?.id,
            marked_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            meeting_id: meetingId,
            user_id: userId,
            status,
            notes,
            marked_by: profile?.id,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.meetingId] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to mark attendance', description: error.message, variant: 'destructive' });
    },
  });
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      meetingId,
      userIds,
      status,
    }: {
      meetingId: string;
      userIds: string[];
      status: AttendanceStatus;
    }) => {
      // Get existing records
      const { data: existing } = await supabase
        .from('attendance')
        .select('id, user_id')
        .eq('meeting_id', meetingId)
        .in('user_id', userIds);

      const existingUserIds = (existing || []).map((e) => e.user_id);
      const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

      // Update existing records
      if (existing && existing.length > 0) {
        const { error: updateError } = await supabase
          .from('attendance')
          .update({
            status,
            marked_by: profile?.id,
            marked_at: new Date().toISOString(),
          })
          .in('id', existing.map((e) => e.id));
        if (updateError) throw updateError;
      }

      // Insert new records
      if (newUserIds.length > 0) {
        const { error: insertError } = await supabase
          .from('attendance')
          .insert(
            newUserIds.map((userId) => ({
              meeting_id: meetingId,
              user_id: userId,
              status,
              marked_by: profile?.id,
            }))
          );
        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.meetingId] });
      toast({ title: 'Attendance marked for group' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to mark attendance', description: error.message, variant: 'destructive' });
    },
  });
}
