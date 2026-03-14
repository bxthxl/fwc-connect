import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { VoiceGroupBadge } from '@/components/common/VoiceGroupBadge';
import { BranchSelector } from '@/components/admin/BranchSelector';
import { useAllEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, useEventBGVs, Event } from '@/hooks/useEvents';
import { useMembers } from '@/hooks/useMembers';
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarDays, Plus, Pencil, Trash2, Loader2, Search, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Profile, VOICE_GROUP_LABELS } from '@/types/database';

function BGVPicker({ members, selectedIds, onToggle }: { members: Profile[]; selectedIds: string[]; onToggle: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    VOICE_GROUP_LABELS[m.voice_group].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label>Backup Vocalists (BGVs)</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>
      <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
        {filtered.map(m => (
          <label key={m.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer">
            <Checkbox checked={selectedIds.includes(m.id)} onCheckedChange={() => onToggle(m.id)} />
            <MemberAvatar profile={m} size="sm" />
            <span className="text-sm flex-1 truncate">{m.full_name}</span>
            <VoiceGroupBadge group={m.voice_group} size="sm" />
          </label>
        ))}
      </div>
      {selectedIds.length > 0 && <p className="text-xs text-muted-foreground">{selectedIds.length} BGV(s) selected</p>}
    </div>
  );
}

export default function EventsManagementPage() {
  const { profile, isSuperAdmin } = useAuth();
  const [branchFilter, setBranchFilter] = useState<string | null>(profile?.branch_id ?? null);
  const { data: events, isLoading } = useAllEvents(branchFilter);
  const { data: members } = useMembers(undefined, branchFilter);
  const { data: branches } = useBranches();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', dress_code: '', branch_id: '' });
  const [selectedBGVs, setSelectedBGVs] = useState<string[]>([]);

  const openNew = () => {
    setEditing(null);
    setForm({ title: '', description: '', event_date: '', start_time: '', end_time: '', location: '', dress_code: '', branch_id: '' });
    setSelectedBGVs([]);
    setDialogOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditing(event);
    setForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time || '',
      location: event.location,
      dress_code: event.dress_code || '',
      branch_id: event.branch_id || '',
    });
    setDialogOpen(true);
  };

  const toggleBGV = (id: string) => {
    setSelectedBGVs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description || null,
      event_date: form.event_date,
      start_time: form.start_time,
      end_time: form.end_time || null,
      location: form.location,
      dress_code: form.dress_code || null,
      branch_id: form.branch_id || null,
      created_by: profile?.id || null,
      bgv_member_ids: selectedBGVs,
    };

    if (editing) {
      await updateEvent.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createEvent.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  if (isLoading) return <DashboardLayout><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarDays className="h-8 w-8 text-primary" />
              Events Management
            </h1>
            <p className="text-muted-foreground">Create and manage events</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />New Event</Button>
        </div>

        {(!events || events.length === 0) ? (
          <EmptyState icon={CalendarDays} title="No events" description="Create your first event." />
        ) : (
          <div className="grid gap-4">
            {events.map(event => (
              <Card key={event.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(event)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{event.title}". This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteEvent.mutate(event.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>{format(parseISO(event.event_date), 'MMMM d, yyyy')} at {event.start_time}</p>
                  <p>{event.location}</p>
                  {event.dress_code && <p className="text-foreground">Dress Code: {event.dress_code}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Event' : 'Create Event'}</DialogTitle>
              <DialogDescription>{editing ? 'Update event details' : 'Set up a new event'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select value={form.branch_id} onValueChange={v => setForm({...form, branch_id: v === 'all' ? '' : v})}>
                    <SelectTrigger><SelectValue placeholder="All branches" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All branches</SelectItem>
                      {(branches || []).map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Dress Code</Label>
                <Input value={form.dress_code} onChange={e => setForm({...form, dress_code: e.target.value})} placeholder="e.g. White and Gold" />
              </div>
              {members && <BGVPicker members={members} selectedIds={selectedBGVs} onToggle={toggleBGV} />}
              <Button type="submit" className="w-full" disabled={createEvent.isPending || updateEvent.isPending}>
                {(createEvent.isPending || updateEvent.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Update Event' : 'Create Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
