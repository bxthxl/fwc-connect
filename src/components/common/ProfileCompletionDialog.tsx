import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useBranches } from '@/hooks/useBranches';
import { useChurchRoles, useSetMemberChurchRoles, useMemberChurchRoles } from '@/hooks/useChurchRoles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function ProfileCompletionDialog() {
  const { profile, refreshProfile } = useAuth();
  const { data: branches } = useBranches();
  const { data: churchRoles } = useChurchRoles();
  const { data: memberRoles } = useMemberChurchRoles(profile?.id);
  const setMemberChurchRoles = useSetMemberChurchRoles();

  const [open, setOpen] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const needsBranch = profile && !profile.branch_id;
  const needsChurchRoles = profile && memberRoles && memberRoles.length === 0;

  useEffect(() => {
    if (profile && (needsBranch || needsChurchRoles)) {
      setOpen(true);
    }
  }, [profile, needsBranch, needsChurchRoles]);

  const toggleRole = (id: string) => {
    setSelectedRoleIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (needsBranch && !branchId) {
      toast({ title: 'Please select your branch', variant: 'destructive' });
      return;
    }
    if (needsChurchRoles && selectedRoleIds.length === 0) {
      toast({ title: 'Please select at least one church role', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      if (needsBranch && branchId) {
        const { error } = await supabase
          .from('profiles')
          .update({ branch_id: branchId })
          .eq('id', profile!.id);
        if (error) throw error;
      }

      if (needsChurchRoles && selectedRoleIds.length > 0) {
        await setMemberChurchRoles.mutateAsync({ profileId: profile!.id, roleIds: selectedRoleIds });
      }

      await refreshProfile();
      setOpen(false);
      toast({ title: 'Profile updated!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile || (!needsBranch && !needsChurchRoles)) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onPointerDownOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            We need a few more details to set up your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {needsBranch && (
            <div className="space-y-2">
              <Label>Select Your Branch *</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your FWC branch" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-60">
                    {(branches || []).map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          )}

          {needsChurchRoles && (
            <div className="space-y-2">
              <Label>Select Your Church Role(s) *</Label>
              <p className="text-xs text-muted-foreground">You can select multiple roles.</p>
              <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                {(churchRoles || []).map(role => (
                  <label key={role.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded p-1">
                    <Checkbox
                      checked={selectedRoleIds.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <span className="text-sm">{role.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleSave} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save & Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
