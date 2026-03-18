import { useState } from 'react';
import { Profile, VoiceGroup, InstrumentType, VOICE_GROUPS, INSTRUMENTS, VOICE_GROUP_LABELS, INSTRUMENT_LABELS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithDropdowns } from '@/components/ui/date-picker-with-dropdowns';
import { useUpdateProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';
import { validateNigerianPhone } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditFormProps {
  profile: Profile;
  onCancel: () => void;
  onSuccess: () => void;
}

export function ProfileEditForm({ profile, onCancel, onSuccess }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    phone: profile.phone || '',
    residence: profile.residence,
    birthday: profile.birthday,
    voice_group: profile.voice_group,
    primary_instrument: profile.primary_instrument,
    secondary_instrument: profile.secondary_instrument,
    care_group_leader_name: profile.care_group_leader_name,
    care_group_leader_phone: profile.care_group_leader_phone,
  });

  const updateProfile = useUpdateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({
      id: profile.id,
      ...formData,
      phone: formData.phone || null,
    });
    onSuccess();
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="residence">Residence</Label>
            <Input
              id="residence"
              value={formData.residence}
              onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Birthday</Label>
            <DatePickerWithDropdowns
              selected={formData.birthday ? new Date(formData.birthday) : undefined}
              onSelect={(date) => setFormData({ ...formData, birthday: date ? date.toISOString().split('T')[0] : '' })}
            />
          </div>

          <div className="space-y-2">
            <Label>Voice Group</Label>
            <Select
              value={formData.voice_group}
              onValueChange={(value: VoiceGroup) => setFormData({ ...formData, voice_group: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICE_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {VOICE_GROUP_LABELS[group]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary Instrument</Label>
              <Select
                value={formData.primary_instrument || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, primary_instrument: value === 'none' ? null : (value as InstrumentType) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instrument" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {INSTRUMENTS.map((instrument) => (
                    <SelectItem key={instrument} value={instrument}>
                      {INSTRUMENT_LABELS[instrument]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Secondary Instrument</Label>
              <Select
                value={formData.secondary_instrument || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, secondary_instrument: value === 'none' ? null : (value as InstrumentType) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instrument" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {INSTRUMENTS.map((instrument) => (
                    <SelectItem key={instrument} value={instrument}>
                      {INSTRUMENT_LABELS[instrument]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="care_group_leader_name">Care Group Leader Name</Label>
              <Input
                id="care_group_leader_name"
                value={formData.care_group_leader_name}
                onChange={(e) => setFormData({ ...formData, care_group_leader_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="care_group_leader_phone">Care Group Leader Phone</Label>
              <Input
                id="care_group_leader_phone"
                type="tel"
                value={formData.care_group_leader_phone}
                onChange={(e) => setFormData({ ...formData, care_group_leader_phone: e.target.value })}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
