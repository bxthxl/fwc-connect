import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useBranches } from '@/hooks/useBranches';
import { useChurchRoles, useSetMemberChurchRoles } from '@/hooks/useChurchRoles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function ProfileCompletionDialog() {
  const { profile, refreshProfile } = useAuth();
  const { data: branches } = useBranches();
  const { data: churchRoles } = useChurchRoles();
  const setMemberChurchRoles = useSetMemberChurchRoles();

  const [open, setOpen] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [selectedChurchRoles, setSelectedChurchRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const needsBranch = profile && !profile.branch_id;

  useEffect(() => {
    if (profile && needsBranch) {
      setOpen(true);
    }
  }, [profile, needsBranch]);

  const handleSave = async () => {
    if (!branchId) {
      toast({ title: 'Please select your branch', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ branch_id: branchId })
        .eq('id', profile!.id);
      if (error) throw error;

      if (selectedChurchRoles.length > 0) {
        await setMemberChurchRoles.mutateAsync({ profileId: profile!.id, roleIds: selectedChurchRoles });
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

  if (!profile || !needsBranch) return null;

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

          <div className="space-y-2">
            <Label>Church Roles (Optional)</Label>
            <p className="text-xs text-muted-foreground">Select any roles that apply, or skip if you're just a choir member.</p>
            <ScrollArea className="h-40 border rounded-md p-3">
              <div className="space-y-2">
                {(churchRoles || []).map(role => (
                  <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedChurchRoles.includes(role.id)}
                      onCheckedChange={(checked) => {
                        setSelectedChurchRoles(prev =>
                          checked ? [...prev, role.id] : prev.filter(id => id !== role.id)
                        );
                      }}
                    />
                    <span className="text-sm">{role.name}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save & Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
