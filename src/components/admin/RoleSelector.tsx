import { AppRole, ROLE_LABELS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Loader2 } from 'lucide-react';

interface RoleSelectorProps {
  currentRoles: AppRole[];
  onRoleChange: (role: AppRole, action: 'add' | 'remove') => void;
  isLoading?: boolean;
}

const ALL_ROLES: AppRole[] = ['super_admin', 'admin', 'attendance_taker', 'minutes_taker'];

export function RoleSelector({ currentRoles, onRoleChange, isLoading }: RoleSelectorProps) {
  const availableRoles = ALL_ROLES.filter((role) => !currentRoles.includes(role));

  return (
    <div className="space-y-3">
      {/* Current Roles */}
      {currentRoles.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {currentRoles.map((role) => (
            <Badge key={role} variant="secondary" className="pr-1 flex items-center gap-1">
              {ROLE_LABELS[role]}
              <button
                onClick={() => onRoleChange(role, 'remove')}
                disabled={isLoading}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No special roles assigned</p>
      )}

      {/* Add Role */}
      {availableRoles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableRoles.map((role) => (
            <Button
              key={role}
              variant="outline"
              size="sm"
              onClick={() => onRoleChange(role, 'add')}
              disabled={isLoading}
              className="h-7"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Plus className="h-3 w-3 mr-1" />
              )}
              {ROLE_LABELS[role]}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
