import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { useAllOnboardingContent, useUpdateOnboardingContent, OnboardingContent } from '@/hooks/useOnboarding';
import { BookOpen, Save } from 'lucide-react';

function ContentEditor({ item }: { item: OnboardingContent }) {
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);
  const [isActive, setIsActive] = useState(item.is_active);
  const updateContent = useUpdateOnboardingContent();

  useEffect(() => {
    setTitle(item.title);
    setBody(item.body);
    setIsActive(item.is_active);
  }, [item]);

  const hasChanges = title !== item.title || body !== item.body || isActive !== item.is_active;

  const handleSave = () => {
    updateContent.mutate({ id: item.id, title, body, is_active: isActive });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{item.key}</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor={`active-${item.id}`} className="text-xs text-muted-foreground">
              Active
            </Label>
            <Switch
              id={`active-${item.id}`}
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Body</Label>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
        </div>
        {hasChanges && (
          <Button size="sm" onClick={handleSave} disabled={updateContent.isPending}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function OnboardingSettingsPage() {
  const { data: content, isLoading } = useAllOnboardingContent();

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Onboarding Settings
          </h1>
          <p className="text-muted-foreground">
            Manage the welcome message and app guide content shown to new members.
          </p>
        </div>

        <div className="space-y-4">
          {content?.map((item) => (
            <ContentEditor key={item.id} item={item} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
