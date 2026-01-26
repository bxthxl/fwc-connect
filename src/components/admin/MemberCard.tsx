import { Profile, VOICE_GROUP_LABELS, AppRole, ROLE_LABELS } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { VoiceGroupBadge } from '@/components/common/VoiceGroupBadge';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail } from 'lucide-react';

interface MemberCardProps {
  member: Profile;
  roles?: AppRole[];
  onClick?: () => void;
}

export function MemberCard({ member, roles = [], onClick }: MemberCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{member.full_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <VoiceGroupBadge group={member.voice_group} size="sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          {member.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{member.phone}</span>
            </div>
          )}
        </div>

        {roles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {roles.map((role) => (
              <Badge key={role} variant="secondary" className="text-xs">
                {ROLE_LABELS[role]}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
