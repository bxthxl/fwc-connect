import { useState } from 'react';
import { Profile, VoiceGroup, InstrumentType, VOICE_GROUPS, INSTRUMENTS, VOICE_GROUP_LABELS, INSTRUMENT_LABELS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithDropdowns } from '@/components/ui/date-picker-with-dropdowns';
import { Loader2 } from 'lucide-react';
import { validateNigerianPhone } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useBranches } from '@/hooks/useBranches';

interface AdminMemberEditFormProps {
  member: Profile;
  onCancel: () => void;
  onSuccess: () => void;
}

export function AdminMemberEditForm({ member, onCancel, onSuccess }: AdminMemberEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: branches } = useBranches();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: member.full_name,
    phone: member.phone || '',
    email: member.email,
    residence: member.residence,
    birthday: member.birthday,
    year_joined: member.year_joined,
    voice_group: member.voice_group,
    primary_instrument: member.primary_instrument,
    secondary_instrument: member.secondary_instrument,
    care_group_leader_name: member.care_group_leader_name,
    care_group_leader_phone: member.care_group_leader_phone,
    branch_id: member.branch_id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone && !validateNigerianPhone(formData.phone)) {
      toast({ title: 'Invalid phone number', description: 'Please enter a valid Nigerian phone number', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          email: formData.email,
          residence: formData.residence,
          birthday: formData.birthday,
          year_joined: formData.year_joined,
          voice_group: formData.voice_group,
          primary_instrument: formData.primary_instrument,
          secondary_instrument: formData.secondary_instrument,
          care_group_leader_name: formData.care_group_leader_name,
          care_group_leader_phone: formData.care_group_leader_phone,
          branch_id: formData.branch_id,
        })
        .eq('id', member.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: 'Member updated successfully' });
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Failed to update member', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
      </div>

      <div className="space-y-2">
        <Label>Phone</Label>
        <Input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
      </div>

      <div className="space-y-2">
        <Label>Residence</Label>
        <Input value={formData.residence} onChange={e => setFormData({ ...formData, residence: e.target.value })} required />
      </div>

      <div className="space-y-2">
        <Label>Birthday</Label>
        <DatePickerWithDropdowns
          selected={formData.birthday ? new Date(formData.birthday) : undefined}
          onSelect={(date) => setFormData({ ...formData, birthday: date ? date.toISOString().split('T')[0] : '' })}
        />
      </div>

      <div className="space-y-2">
        <Label>Year Joined</Label>
        <Input type="number" value={formData.year_joined} onChange={e => setFormData({ ...formData, year_joined: parseInt(e.target.value) })} required />
      </div>

      <div className="space-y-2">
        <Label>Branch</Label>
        <Select value={formData.branch_id || 'none'} onValueChange={v => setFormData({ ...formData, branch_id: v === 'none' ? null : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No branch</SelectItem>
            {branches?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Voice Group</Label>
        <Select value={formData.voice_group} onValueChange={(v: VoiceGroup) => setFormData({ ...formData, voice_group: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {VOICE_GROUPS.map(g => <SelectItem key={g} value={g}>{VOICE_GROUP_LABELS[g]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label>Primary Instrument</Label>
          <Select value={formData.primary_instrument || 'none'} onValueChange={v => setFormData({ ...formData, primary_instrument: v === 'none' ? null : v as InstrumentType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {INSTRUMENTS.map(i => <SelectItem key={i} value={i}>{INSTRUMENT_LABELS[i]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Secondary Instrument</Label>
          <Select value={formData.secondary_instrument || 'none'} onValueChange={v => setFormData({ ...formData, secondary_instrument: v === 'none' ? null : v as InstrumentType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {INSTRUMENTS.map(i => <SelectItem key={i} value={i}>{INSTRUMENT_LABELS[i]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="space-y-2">
          <Label>Care Group Leader</Label>
          <Input value={formData.care_group_leader_name} onChange={e => setFormData({ ...formData, care_group_leader_name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Leader Phone</Label>
          <Input type="tel" value={formData.care_group_leader_phone} onChange={e => setFormData({ ...formData, care_group_leader_phone: e.target.value })} required />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}