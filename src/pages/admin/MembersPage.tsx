import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MemberCard } from '@/components/admin/MemberCard';
import { MemberDetailsSheet } from '@/components/admin/MemberDetailsSheet';
import { IncompleteRegistrationCard, IncompleteUser } from '@/components/admin/IncompleteRegistrationCard';
import { VoiceGroupFilter } from '@/components/admin/VoiceGroupFilter';
import { BranchSelector } from '@/components/admin/BranchSelector';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMembersWithRoles, useAddRole, useRemoveRole } from '@/hooks/useMembers';
import { useAuth } from '@/contexts/AuthContext';
import { Profile, VoiceGroup, AppRole } from '@/types/database';
import { Users, Search, UserX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function MembersPage() {
  const { profile, isSuperAdmin } = useAuth();
  const [voiceGroupFilter, setVoiceGroupFilter] = useState<VoiceGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [branchFilter, setBranchFilter] = useState<string | null>(
    profile?.branch_id ?? null
  );

  const { data: members, isLoading } = useMembersWithRoles(voiceGroupFilter || undefined, branchFilter);
  const addRole = useAddRole();
  const removeRole = useRemoveRole();

  // Fetch incomplete registrations
  const { data: incompleteUsers = [], isLoading: incompleteLoading } = useQuery({
    queryKey: ['incomplete-registrations'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-incomplete-registrations`,
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      if (!resp.ok) return [];
      return (await resp.json()) as IncompleteUser[];
    },
  });

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

  const filteredIncomplete = incompleteUsers.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
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

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <BranchSelector
            selectedBranchId={branchFilter}
            onBranchChange={setBranchFilter}
          />
        </div>

        <Tabs defaultValue="registered">
          <TabsList>
            <TabsTrigger value="registered">
              Registered ({filteredMembers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="incomplete">
              Incomplete ({filteredIncomplete.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registered" className="space-y-4 mt-4">
            <VoiceGroupFilter
              selected={voiceGroupFilter}
              onChange={setVoiceGroupFilter}
            />

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
          </TabsContent>

          <TabsContent value="incomplete" className="space-y-4 mt-4">
            {incompleteLoading ? (
              <LoadingSpinner />
            ) : filteredIncomplete.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredIncomplete.map((user) => (
                  <IncompleteRegistrationCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={UserX}
                title="No incomplete registrations"
                description="All signed-up users have completed their profiles"
              />
            )}
          </TabsContent>
        </Tabs>

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