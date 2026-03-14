import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { MeetingForm } from '@/components/admin/MeetingForm';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BranchSelector } from '@/components/admin/BranchSelector';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMeetings, useCreateMeeting, useUpdateMeeting, useDeleteMeeting } from '@/hooks/useMeetings';
import { useAuth } from '@/contexts/AuthContext';
import { Meeting } from '@/types/database';
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react';

export default function MeetingsManagementPage() {
  const { profile, isSuperAdmin } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deletingMeeting, setDeletingMeeting] = useState<Meeting | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(profile?.branch_id ?? null);

  const { data: meetings, isLoading } = useMeetings(undefined, branchFilter);
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  const handleCreate = async (data: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    await createMeeting.mutateAsync(data);
    setIsCreating(false);
  };

  const handleUpdate = async (data: Partial<Meeting>) => {
    if (!editingMeeting) return;
    await updateMeeting.mutateAsync({ id: editingMeeting.id, ...data });
    setEditingMeeting(null);
  };

  const handleDelete = async () => {
    if (!deletingMeeting) return;
    await deleteMeeting.mutateAsync(deletingMeeting.id);
    setDeletingMeeting(null);
  };

  if (isCreating || editingMeeting) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isCreating ? 'Create Meeting' : 'Edit Meeting'}
            </h1>
          </div>
          <MeetingForm
            meeting={editingMeeting || undefined}
            onSubmit={isCreating ? handleCreate : handleUpdate}
            onCancel={() => {
              setIsCreating(false);
              setEditingMeeting(null);
            }}
            isLoading={createMeeting.isPending || updateMeeting.isPending}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meetings Management</h1>
            <p className="text-muted-foreground">Create and manage choir meetings</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Meeting
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : meetings && meetings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="relative group">
                <MeetingCard meeting={meeting} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => setEditingMeeting(meeting)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => setDeletingMeeting(meeting)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No meetings yet"
            description="Create your first meeting to get started"
            action={
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Meeting
              </Button>
            }
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingMeeting} onOpenChange={() => setDeletingMeeting(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingMeeting?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
