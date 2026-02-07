import React from 'react';
import { Home, Calendar, Music, FileText, User, BookOpen } from 'lucide-react';

const STEP_ICONS: Record<string, React.ElementType> = {
  guide_home: Home,
  guide_meetings: Calendar,
  guide_songs: Music,
  guide_minutes: FileText,
  guide_profile: User,
};

interface OnboardingStepProps {
  stepKey: string;
  title: string;
  body: string;
  isActive?: boolean;
}

export function OnboardingStep({ stepKey, title, body, isActive }: OnboardingStepProps) {
  const Icon = STEP_ICONS[stepKey] || BookOpen;

  return (
    <div
      className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
        isActive ? 'border-primary bg-primary/5' : 'border-border'
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
