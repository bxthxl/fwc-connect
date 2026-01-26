import { Profile, AppRole, VOICE_GROUP_LABELS, INSTRUMENT_LABELS, ROLE_LABELS } from '@/types/database';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { VoiceGroupBadge } from '@/components/common/VoiceGroupBadge';
import { InstrumentBadge } from '@/components/common/InstrumentBadge';
import { RoleSelector } from '@/components/admin/RoleSelector';
import { User, Phone, Mail, MapPin, Calendar, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

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
  if (!member) return null;

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
          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Contact
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{member.residence}</span>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Personal
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Birthday: {format(parseISO(member.birthday), 'MMMM d')}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Member since:</span> {member.year_joined}
              </div>
            </div>
          </div>

          {/* Instruments */}
          {(member.primary_instrument || member.secondary_instrument) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Instruments
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.primary_instrument && (
                  <InstrumentBadge instrument={member.primary_instrument} />
                )}
                {member.secondary_instrument && (
                  <InstrumentBadge instrument={member.secondary_instrument} />
                )}
              </div>
            </div>
          )}

          {/* Care Group */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Care Group
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{member.care_group_leader_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{member.care_group_leader_phone}</span>
              </div>
            </div>
          </div>

          {/* Role Management */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Roles
            </h3>
            <RoleSelector
              currentRoles={roles}
              onRoleChange={onRoleChange}
              isLoading={isRoleLoading}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
