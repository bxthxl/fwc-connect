import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { InstrumentType, INSTRUMENT_LABELS } from '@/types/database';
import { Music } from 'lucide-react';

interface InstrumentBadgeProps {
  instrument: InstrumentType;
  className?: string;
  showIcon?: boolean;
}

export function InstrumentBadge({ instrument, className, showIcon = false }: InstrumentBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'bg-accent/20 text-accent-foreground border-accent/50',
        className
      )}
    >
      {showIcon && <Music className="h-3 w-3 mr-1" />}
      {INSTRUMENT_LABELS[instrument]}
    </Badge>
  );
}
