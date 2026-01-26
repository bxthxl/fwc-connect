import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AttendanceStatus, ATTENDANCE_STATUS_LABELS } from '@/types/database';
import { Check, X, Clock } from 'lucide-react';

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<AttendanceStatus, { class: string; icon: React.ElementType }> = {
  present: { class: 'status-present', icon: Check },
  absent: { class: 'status-absent', icon: X },
  excused: { class: 'status-excused', icon: Clock },
};

export function AttendanceStatusBadge({ status, className, showIcon = true }: AttendanceStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={cn(config.class, 'font-medium', className)}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {ATTENDANCE_STATUS_LABELS[status]}
    </Badge>
  );
}
