import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MemberCard } from '@/components/admin/MemberCard';
import { VoiceGroupFilter } from '@/components/admin/VoiceGroupFilter';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { VoiceGroupBadge } from '@/components/common/VoiceGroupBadge';
import { InstrumentBadge } from '@/components/common/InstrumentBadge';
import { Badge } from '@/components/ui/badge';
import { useMembers } from '@/hooks/useMembers';
import { useBranches } from '@/hooks/useBranches';
import { useChurchRoles, useAllMemberChurchRoles } from '@/hooks/useChurchRoles';
import { Profile, VoiceGroup } from '@/types/database';
import { Users, Search, User, Phone, Mail, MapPin, Calendar, Building2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function MembersDirectoryPage() {
  const [voiceGroupFilter, setVoiceGroupFilter] = useState<VoiceGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: members, isLoading } = useMembers(voiceGroupFilter || undefined);
  const { data: branches } = useBranches();
  const { data: churchRoles } = useChurchRoles();
  const { data: allMemberChurchRoles } = useAllMemberChurchRoles();

  const filtered = members?.filter((m) =>
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const memberBranch = selectedMember ? branches?.find(b => b.id === selectedMember.branch_id) : null;
  const memberChurchRoleIds = selectedMember
    ? (allMemberChurchRoles || []).filter(mcr => mcr.profile_id === selectedMember.id).map(mcr => mcr.church_role_id)
    : [];
  const memberChurchRoleNames = (churchRoles || [])
    .filter(cr => memberChurchRoleIds.includes(cr.id))
    .map(cr => cr.name);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Browse the choir directory</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <VoiceGroupFilter selected={voiceGroupFilter} onChange={setVoiceGroupFilter} />

        {isLoading ? (
          <LoadingSpinner />
        ) : filtered && filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={() => { setSelectedMember(member); setSheetOpen(true); }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={searchTerm ? 'No matching members' : 'No members found'}
            description={searchTerm ? 'Try adjusting your search' : 'Members will appear here once they register'}
          />
        )}

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            {selectedMember && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="block">{selectedMember.full_name}</span>
                      <VoiceGroupBadge group={selectedMember.voice_group} size="sm" />
                    </div>
                  </SheetTitle>
                  <SheetDescription>Member details</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {memberBranch && (
                    <div className="flex items-center gap-2 text-sm bg-muted rounded-lg px-3 py-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">{memberBranch.name}</span>
                    </div>
                  )}

                  {memberChurchRoleNames.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Church Roles</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {memberChurchRoleNames.map(name => <Badge key={name} variant="secondary">{name}</Badge>)}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{selectedMember.email}</span></div>
                      {selectedMember.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{selectedMember.phone}</span></div>}
                      <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{selectedMember.residence}</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Personal</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Birthday: {format(parseISO(selectedMember.birthday), 'MMMM d')}</span></div>
                      <div className="text-sm"><span className="text-muted-foreground">Member since:</span> {selectedMember.year_joined}</div>
                    </div>
                  </div>

                  {(selectedMember.primary_instrument || selectedMember.secondary_instrument) && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Instruments</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.primary_instrument && <InstrumentBadge instrument={selectedMember.primary_instrument} />}
                        {selectedMember.secondary_instrument && <InstrumentBadge instrument={selectedMember.secondary_instrument} />}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
