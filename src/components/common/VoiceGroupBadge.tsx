import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VoiceGroup, VOICE_GROUP_LABELS } from '@/types/database';

interface VoiceGroupBadgeProps {
  group: VoiceGroup;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const groupColors: Record<VoiceGroup, string> = {
  soprano: 'badge-soprano',
  alto: 'badge-alto',
  tenor: 'badge-tenor',
  bass: 'badge-bass',
  instrumentalist: 'badge-instrumentalist',
};

export function VoiceGroupBadge({ group, className, size = 'md' }: VoiceGroupBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <Badge
      className={cn(
        groupColors[group],
        sizeClasses[size],
        'font-medium',
        className
      )}
    >
      {VOICE_GROUP_LABELS[group]}
    </Badge>
  );
}
