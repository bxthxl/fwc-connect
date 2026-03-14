import { useAuth } from '@/contexts/AuthContext';
import { useBranches, Branch } from '@/hooks/useBranches';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface BranchSelectorProps {
  selectedBranchId: string | null;
  onBranchChange: (branchId: string | null) => void;
}

export function BranchSelector({ selectedBranchId, onBranchChange }: BranchSelectorProps) {
  const { isSuperAdmin } = useAuth();
  const { data: branches } = useBranches();

  if (!isSuperAdmin) return null;

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedBranchId ?? 'all'}
        onValueChange={(val) => onBranchChange(val === 'all' ? null : val)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="All Branches" />
        </SelectTrigger>
        <SelectContent>
          {branches?.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
