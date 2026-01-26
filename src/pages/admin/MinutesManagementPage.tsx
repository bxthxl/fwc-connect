import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useMeetings } from '@/hooks/useMeetings';
import { useMinutes, useCreateMinutes, useUpdateMinutes, useDeleteMinutes, MinutesWithMeeting } from '@/hooks/useMinutes';
import { FileText, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function MinutesManagementPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingMinutes, setEditingMinutes] = useState<MinutesWithMeeting | null>(null);
  const [deletingMinutes, setDeletingMinutes] = useState<MinutesWithMeeting | null>(null);

  const [formData, setFormData] = useState({
    meeting_id: '',
    content: '',
    is_published: false,
  });

  const { data: meetings } = useMeetings();
  const { data: minutesList, isLoading } = useMinutes(true);
  const createMinutes = useCreateMinutes();
  const updateMinutes = useUpdateMinutes();
  const deleteMinutes = useDeleteMinutes();

  // Get meetings that don't have minutes yet
  const availableMeetings = meetings?.filter(
    (m) => !minutesList?.some((min) => min.meeting_id === m.id)
  );

  const handleStartCreate = () => {
    setFormData({ meeting_id: '', content: '', is_published: false });
    setIsCreating(true);
  };

  const handleStartEdit = (minutes: MinutesWithMeeting) => {
    setFormData({
      meeting_id: minutes.meeting_id,
      content: minutes.content,
      is_published: minutes.is_published,
    });
    setEditingMinutes(minutes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      await createMinutes.mutateAsync(formData);
      setIsCreating(false);
    } else if (editingMinutes) {
      await updateMinutes.mutateAsync({
        id: editingMinutes.id,
        content: formData.content,
        is_published: formData.is_published,
      });
      setEditingMinutes(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingMinutes) return;
    await deleteMinutes.mutateAsync(deletingMinutes.id);
    setDeletingMinutes(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingMinutes(null);
  };

  if (isCreating || editingMinutes) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isCreating ? 'Create Minutes' : 'Edit Minutes'}
            </h1>
          </div>
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Meeting Minutes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCreating && (
                  <div className="space-y-2">
                    <Label>Meeting</Label>
                    <Select
                      value={formData.meeting_id}
                      onValueChange={(value) => setFormData({ ...formData, meeting_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a meeting" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMeetings?.map((meeting) => (
                          <SelectItem key={meeting.id} value={meeting.id}>
                            {meeting.title} - {format(parseISO(meeting.meeting_date), 'MMM d, yyyy')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write the meeting minutes here... (HTML supported)"
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can use HTML tags for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Publish immediately</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMinutes.isPending || updateMinutes.isPending || (isCreating && !formData.meeting_id)}
                >
                  {(createMinutes.isPending || updateMinutes.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isCreating ? 'Create' : 'Update'} Minutes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Minutes Management</h1>
            <p className="text-muted-foreground">Create and publish meeting minutes</p>
          </div>
          <Button onClick={handleStartCreate} disabled={!availableMeetings?.length}>
            <Plus className="h-4 w-4 mr-2" />
            Create Minutes
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : minutesList && minutesList.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {minutesList.map((minutes) => (
              <Card key={minutes.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{minutes.meetings.title}</CardTitle>
                    <Badge variant={minutes.is_published ? 'default' : 'secondary'}>
                      {minutes.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(minutes.meetings.meeting_date), 'MMMM d, yyyy')}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {minutes.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleStartEdit(minutes)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeletingMinutes(minutes)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No minutes yet"
            description={
              availableMeetings?.length
                ? 'Create minutes for a meeting to get started'
                : 'Create a meeting first, then add minutes'
            }
            action={
              availableMeetings?.length ? (
                <Button onClick={handleStartCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Minutes
                </Button>
              ) : undefined
            }
          />
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingMinutes} onOpenChange={() => setDeletingMinutes(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Minutes</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete these minutes? This action cannot be undone.
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
