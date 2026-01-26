import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MemberCard } from '@/components/admin/MemberCard';
import { MemberDetailsSheet } from '@/components/admin/MemberDetailsSheet';
import { VoiceGroupFilter } from '@/components/admin/VoiceGroupFilter';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { useMembersWithRoles, useAddRole, useRemoveRole } from '@/hooks/useMembers';
import { Profile, VoiceGroup, AppRole } from '@/types/database';
import { Users, Search } from 'lucide-react';

export default function MembersPage() {
  const [voiceGroupFilter, setVoiceGroupFilter] = useState<VoiceGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: members, isLoading } = useMembersWithRoles(voiceGroupFilter || undefined);
  const addRole = useAddRole();
  const removeRole = useRemoveRole();

  const handleMemberClick = (member: Profile) => {
    setSelectedMember(member);
    setSheetOpen(true);
  };

  const handleRoleChange = async (role: AppRole, action: 'add' | 'remove') => {
    if (!selectedMember) return;
    
    if (action === 'add') {
      await addRole.mutateAsync({ userId: selectedMember.id, role });
    } else {
      await removeRole.mutateAsync({ userId: selectedMember.id, role });
    }
  };

  const filteredMembers = members?.filter((member) =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMemberRoles = selectedMember
    ? members?.find((m) => m.id === selectedMember.id)?.roles || []
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">View and manage choir members</p>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <VoiceGroupFilter
            selected={voiceGroupFilter}
            onChange={setVoiceGroupFilter}
          />
        </div>

        {/* Members Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredMembers && filteredMembers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                roles={member.roles}
                onClick={() => handleMemberClick(member)}
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

        {/* Member Details Sheet */}
        <MemberDetailsSheet
          member={selectedMember}
          roles={selectedMemberRoles}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onRoleChange={handleRoleChange}
          isRoleLoading={addRole.isPending || removeRole.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
