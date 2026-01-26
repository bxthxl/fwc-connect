import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AnnouncementForm } from '@/components/admin/AnnouncementForm';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  getAnnouncementStatus,
} from '@/hooks/useAnnouncements';
import { Announcement } from '@/types/database';
import { Megaphone, Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AnnouncementsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  const { data: announcements, isLoading } = useAnnouncements(true);
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const handleCreate = async (data: {
    title: string;
    body: string;
    visible_from: string;
    visible_to: string;
  }) => {
    await createAnnouncement.mutateAsync(data);
    setIsCreating(false);
  };

  const handleUpdate = async (data: {
    title: string;
    body: string;
    visible_from: string;
    visible_to: string;
  }) => {
    if (!editingAnnouncement) return;
    await updateAnnouncement.mutateAsync({ id: editingAnnouncement.id, ...data });
    setEditingAnnouncement(null);
  };

  const handleDelete = async () => {
    if (!deletingAnnouncement) return;
    await deleteAnnouncement.mutateAsync(deletingAnnouncement.id);
    setDeletingAnnouncement(null);
  };

  const getStatusBadge = (status: 'active' | 'scheduled' | 'expired') => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      active: 'default',
      scheduled: 'secondary',
      expired: 'outline',
    };
    const labels: Record<string, string> = {
      active: 'Active',
      scheduled: 'Scheduled',
      expired: 'Expired',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (isCreating || editingAnnouncement) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isCreating ? 'Create Announcement' : 'Edit Announcement'}
            </h1>
          </div>
          <AnnouncementForm
            announcement={editingAnnouncement || undefined}
            onSubmit={isCreating ? handleCreate : handleUpdate}
            onCancel={() => {
              setIsCreating(false);
              setEditingAnnouncement(null);
            }}
            isLoading={createAnnouncement.isPending || updateAnnouncement.isPending}
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
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Manage choir announcements</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Announcement
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : announcements && announcements.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((announcement) => {
              const status = getAnnouncementStatus(announcement);
              return (
                <Card key={announcement.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      {getStatusBadge(status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {announcement.body}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(parseISO(announcement.visible_from), 'MMM d')} -{' '}
                        {format(parseISO(announcement.visible_to), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAnnouncement(announcement)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingAnnouncement(announcement)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description="Create an announcement to share news with choir members"
            action={
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            }
          />
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingAnnouncement} onOpenChange={() => setDeletingAnnouncement(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingAnnouncement?.title}"? This action cannot be undone.
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
