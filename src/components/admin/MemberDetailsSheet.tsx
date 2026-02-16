import { useState } from 'react';
import { Profile, AppRole, VOICE_GROUP_LABELS, INSTRUMENT_LABELS, ROLE_LABELS } from '@/types/database';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { VoiceGroupBadge } from '@/components/common/VoiceGroupBadge';
import { InstrumentBadge } from '@/components/common/InstrumentBadge';
import { RoleSelector } from '@/components/admin/RoleSelector';
import { User, Phone, Mail, MapPin, Calendar, Users, KeyRound, Trash2, Loader2, Building2, Lock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBranches } from '@/hooks/useBranches';
import { useChurchRoles, useAllMemberChurchRoles } from '@/hooks/useChurchRoles';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface MemberDetailsSheetProps {
  member: Profile | null;
  roles: AppRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (role: AppRole, action: 'add' | 'remove') => void;
  isRoleLoading?: boolean;
}

export function MemberDetailsSheet({
  member,
  roles,
  open,
  onOpenChange,
  onRoleChange,
  isRoleLoading,
}: MemberDetailsSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: branches } = useBranches();
  const { data: churchRoles } = useChurchRoles();
  const { data: allMemberChurchRoles } = useAllMemberChurchRoles();
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showSetPasswordDialog, setShowSetPasswordDialog] = useState(false);

  if (!member) return null;

  const memberBranch = branches?.find(b => b.id === member.branch_id);
  const memberChurchRoleIds = (allMemberChurchRoles || [])
    .filter(mcr => mcr.profile_id === member.id)
    .map(mcr => mcr.church_role_id);
  const memberChurchRoleNames = (churchRoles || [])
    .filter(cr => memberChurchRoleIds.includes(cr.id))
    .map(cr => cr.name);

  const handleSetPassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setIsSettingPassword(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-set-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ auth_user_id: member.auth_user_id, password: newPassword }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error);
      toast({ title: 'Password updated', description: `New password has been set for ${member.full_name}. Please share it with them directly.` });
      setNewPassword('');
      setShowSetPasswordDialog(false);
    } catch (error: any) {
      toast({ title: 'Failed to set password', description: error.message, variant: 'destructive' });
    } finally {
      setIsSettingPassword(false);
    }
  };

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ email: member.email }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error);
      toast({ title: 'Password reset email sent', description: `A reset link has been sent to ${member.email}` });
    } catch (error: any) {
      toast({ title: 'Failed to send reset', description: error.message, variant: 'destructive' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ auth_user_id: member.auth_user_id }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error);
      toast({ title: 'Member deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Failed to delete member', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="block">{member.full_name}</span>
              <VoiceGroupBadge group={member.voice_group} size="sm" />
            </div>
          </SheetTitle>
          <SheetDescription>Member details and role management</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Branch */}
          {memberBranch && (
            <div className="flex items-center gap-2 text-sm bg-muted rounded-lg px-3 py-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-medium">{memberBranch.name}</span>
            </div>
          )}

          {/* Church Roles */}
          {memberChurchRoleNames.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Church Roles
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {memberChurchRoleNames.map(name => (
                  <Badge key={name} variant="secondary">{name}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{member.email}</span></div>
              {member.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{member.phone}</span></div>}
              <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{member.residence}</span></div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Personal</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Birthday: {format(parseISO(member.birthday), 'MMMM d')}</span></div>
              <div className="text-sm"><span className="text-muted-foreground">Member since:</span> {member.year_joined}</div>
            </div>
          </div>

          {/* Instruments */}
          {(member.primary_instrument || member.secondary_instrument) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Instruments</h3>
              <div className="flex flex-wrap gap-2">
                {member.primary_instrument && <InstrumentBadge instrument={member.primary_instrument} />}
                {member.secondary_instrument && <InstrumentBadge instrument={member.secondary_instrument} />}
              </div>
            </div>
          )}

          {/* Care Group */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Care Group</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" /><span>{member.care_group_leader_name}</span></div>
              <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{member.care_group_leader_phone}</span></div>
            </div>
          </div>

          {/* Role Management */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Roles</h3>
            <RoleSelector currentRoles={roles} onRoleChange={onRoleChange} isLoading={isRoleLoading} />
          </div>

          {/* Admin Actions */}
          <div className="border-t pt-4 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Admin Actions</h3>
            
            {/* Set New Password - Primary */}
            <AlertDialog open={showSetPasswordDialog} onOpenChange={(open) => { setShowSetPasswordDialog(open); if (!open) setNewPassword(''); }}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Set New Password
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Set New Password</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter a temporary password for {member.full_name}. You'll need to share this password with them directly.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Input
                    type="text"
                    placeholder="Enter temporary password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSetPassword} disabled={isSettingPassword || newPassword.length < 6}>
                    {isSettingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Set Password
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Email Reset - Secondary */}
            <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleResetPassword} disabled={isResetting}>
              {isResetting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
              Send Reset Email (fallback)
            </Button>

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Delete Member
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Member</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {member.full_name}'s account and all associated data. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}