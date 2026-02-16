import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatsCard } from '@/components/admin/StatsCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MapPin, Users, CalendarDays, Calendar, Pencil, Save, X, Church, Phone, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBranches, Branch } from '@/hooks/useBranches';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function WuyeSettingsPage() {
  const { profile } = useAuth();
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ address: '', pastor_name: '', pastor_phone: '' });

  const branchId = profile?.branch_id;

  const branch = branches?.find(b => b.id === branchId) ?? null;

  // Member count for this branch
  const { data: memberCount = 0 } = useQuery({
    queryKey: ['branch-member-count', branchId],
    queryFn: async () => {
      if (!branchId) return 0;
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('branch_id', branchId);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!branchId,
  });

  // Upcoming meetings count
  const today = new Date().toISOString().split('T')[0];
  const { data: upcomingMeetings = 0 } = useQuery({
    queryKey: ['branch-upcoming-meetings', branchId],
    queryFn: async () => {
      if (!branchId) return 0;
      const { count, error } = await supabase
        .from('meetings')
        .select('id', { count: 'exact', head: true })
        .gte('meeting_date', today)
        .or(`branch_id.eq.${branchId},branch_id.is.null`);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!branchId,
  });

  // Upcoming events count
  const { data: upcomingEvents = 0 } = useQuery({
    queryKey: ['branch-upcoming-events', branchId],
    queryFn: async () => {
      if (!branchId) return 0;
      const { count, error } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .gte('event_date', today)
        .or(`branch_id.eq.${branchId},branch_id.is.null`);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!branchId,
  });

  useEffect(() => {
    if (branch) {
      setEditForm({
        address: branch.address ?? '',
        pastor_name: branch.pastor_name ?? '',
        pastor_phone: branch.pastor_phone ?? '',
      });
    }
  }, [branch]);

  const handleSave = async () => {
    if (!branch) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('branches')
        .update({
          address: editForm.address || null,
          pastor_name: editForm.pastor_name || null,
          pastor_phone: editForm.pastor_phone || null,
        })
        .eq('id', branch.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({ title: 'Branch info updated successfully' });
      setIsEditing(false);
    } catch (err: any) {
      toast({ title: 'Failed to update', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (branchesLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (!branch) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            Branch Settings
          </h1>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">No branch is associated with your profile. Please update your profile to select a branch.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            {branch.name}
          </h1>
          <p className="text-muted-foreground">Branch details and quick stats</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Church className="h-5 w-5" />
                  Branch Information
                </CardTitle>
                <CardDescription>Contact and location details</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditForm({ address: branch.address ?? '', pastor_name: branch.pastor_name ?? '', pastor_phone: branch.pastor_phone ?? '' }); }}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Address
                  </Label>
                  {isEditing ? (
                    <Input value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} placeholder="Branch address" />
                  ) : (
                    <p className="text-sm font-medium">{branch.address || '—'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Pastor Name
                  </Label>
                  {isEditing ? (
                    <Input value={editForm.pastor_name} onChange={e => setEditForm(f => ({ ...f, pastor_name: e.target.value }))} placeholder="Pastor name" />
                  ) : (
                    <p className="text-sm font-medium">{branch.pastor_name || '—'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Pastor Phone
                  </Label>
                  {isEditing ? (
                    <Input value={editForm.pastor_phone} onChange={e => setEditForm(f => ({ ...f, pastor_phone: e.target.value }))} placeholder="Pastor phone" />
                  ) : (
                    <p className="text-sm font-medium">{branch.pastor_phone || '—'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Column */}
          <div className="space-y-4">
            <StatsCard title="Members" value={memberCount} icon={Users} description="Registered to this branch" />
            <StatsCard title="Upcoming Meetings" value={upcomingMeetings} icon={CalendarDays} description="Scheduled from today" />
            <StatsCard title="Upcoming Events" value={upcomingEvents} icon={Calendar} description="Scheduled from today" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
