import { Profile, AttendanceStatus, ATTENDANCE_STATUS_LABELS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AttendanceMarkerProps {
  member: Pick<Profile, 'id' | 'full_name' | 'voice_group'>;
  currentStatus?: AttendanceStatus;
  onStatusChange: (status: AttendanceStatus) => void;
  isLoading?: boolean;
}

export function AttendanceMarker({
  member,
  currentStatus,
  onStatusChange,
  isLoading,
}: AttendanceMarkerProps) {
  const statuses: AttendanceStatus[] = ['present', 'absent', 'excused'];

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">{member.full_name}</span>
      <div className="flex gap-1">
        {statuses.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={currentStatus === status ? 'default' : 'outline'}
            className={cn(
              'h-8 px-3',
              currentStatus === status && `status-${status}`
            )}
            onClick={() => onStatusChange(status)}
            disabled={isLoading}
          >
            {ATTENDANCE_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>
    </div>
  );
}
