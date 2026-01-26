import { VoiceGroup, VOICE_GROUPS, VOICE_GROUP_LABELS } from '@/types/database';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceGroupFilterProps {
  selected: VoiceGroup | null;
  onChange: (group: VoiceGroup | null) => void;
}

export function VoiceGroupFilter({ selected, onChange }: VoiceGroupFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange(null)}
      >
        All
      </Button>
      {VOICE_GROUPS.map((group) => (
        <Button
          key={group}
          variant={selected === group ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(group)}
          className={cn(
            selected === group && `badge-${group}`
          )}
        >
          {VOICE_GROUP_LABELS[group]}
        </Button>
      ))}
    </div>
  );
}
