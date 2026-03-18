import { passwordRequirements, getPasswordStrength } from '@/lib/validation';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const strengthColors = {
  weak: 'bg-destructive',
  fair: 'bg-orange-500',
  good: 'bg-yellow-500',
  strong: 'bg-green-500',
};

const strengthLabels = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const barCount = { weak: 1, fair: 2, good: 3, strong: 4 };

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= barCount[strength] ? strengthColors[strength] : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        strength === 'strong' ? 'text-green-600' : 
        strength === 'good' ? 'text-yellow-600' : 
        strength === 'fair' ? 'text-orange-600' : 'text-destructive'
      }`}>
        Password strength: {strengthLabels[strength]}
      </p>
      <ul className="space-y-1">
        {passwordRequirements.map((req) => {
          const passed = req.test(password);
          return (
            <li key={req.label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-600' : 'text-muted-foreground'}`}>
              {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
