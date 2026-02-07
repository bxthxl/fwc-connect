import { Profile, VOICE_GROUP_LABELS, INSTRUMENT_LABELS } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceGroupBadge } from '@/components/common/VoiceGroupBadge';
import { InstrumentBadge } from '@/components/common/InstrumentBadge';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { Button } from '@/components/ui/button';
import { Pencil, Calendar, MapPin, Phone, Mail, Users } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileViewProps {
  profile: Profile;
  onEdit: () => void;
}

export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <MemberAvatar profile={profile} size="lg" />
            <div>
              <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <VoiceGroupBadge group={profile.voice_group} />
                {profile.primary_instrument && (
                  <InstrumentBadge instrument={profile.primary_instrument} />
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Contact Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.residence}</span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Personal Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Birthday: {format(new Date(profile.birthday), 'MMMM d')}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Member since:</span>{' '}
                {profile.year_joined}
              </div>
            </div>
          </div>

          {/* Voice & Instruments */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Voice Group & Instruments
            </h3>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Voice Group:</span>{' '}
                {VOICE_GROUP_LABELS[profile.voice_group]}
              </div>
              {profile.primary_instrument && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Primary Instrument:</span>{' '}
                  {INSTRUMENT_LABELS[profile.primary_instrument]}
                </div>
              )}
              {profile.secondary_instrument && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Secondary Instrument:</span>{' '}
                  {INSTRUMENT_LABELS[profile.secondary_instrument]}
                </div>
              )}
            </div>
          </div>

          {/* Care Group */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Care Group
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{profile.care_group_leader_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.care_group_leader_phone}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
