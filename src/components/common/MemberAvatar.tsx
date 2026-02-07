import { Profile } from '@/types/database';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface MemberAvatarProps {
  profile: Pick<Profile, 'full_name' | 'avatar_url'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
};

export function MemberAvatar({ profile, size = 'md', className }: MemberAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {profile.avatar_url ? (
        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
      ) : null}
      <AvatarFallback className={cn('bg-primary/10 text-primary font-medium', textSizeClasses[size])}>
        {getInitials(profile.full_name)}
      </AvatarFallback>
    </Avatar>
  );
}
