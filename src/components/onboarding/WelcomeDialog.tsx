import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OnboardingStep } from './OnboardingStep';
import { useOnboardingContent, useMarkOnboardingSeen } from '@/hooks/useOnboarding';
import { Sparkles } from 'lucide-react';

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeDialog({ open, onOpenChange }: WelcomeDialogProps) {
  const { data: content, isLoading } = useOnboardingContent();
  const markSeen = useMarkOnboardingSeen();
  const [step, setStep] = useState(0);

  if (isLoading || !content || content.length === 0) return null;

  const welcomeItem = content.find((c) => c.key === 'welcome_message');
  const guideSteps = content.filter((c) => c.key !== 'welcome_message');
  const isWelcomeStep = step === 0;
  const currentGuideIdx = step - 1;
  const isLastStep = step >= guideSteps.length;

  const handleNext = () => {
    if (isLastStep) {
      markSeen.mutate();
      onOpenChange(false);
      setStep(0);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    markSeen.mutate();
    onOpenChange(false);
    setStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {isWelcomeStep ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-[hsl(var(--accent))]" />
                <DialogTitle className="text-xl">{welcomeItem?.title || 'Welcome!'}</DialogTitle>
              </div>
              <DialogDescription className="text-base pt-2">
                {welcomeItem?.body || 'Welcome to the FWC Worship Team Platform!'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Let us give you a quick tour of what's available:
              </p>
            </div>
            <DialogFooter className="flex-row gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
              <Button onClick={handleNext}>Start Tour</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">
                App Guide ({step}/{guideSteps.length})
              </DialogTitle>
            </DialogHeader>
            <div className="py-2">
              {guideSteps[currentGuideIdx] && (
                <OnboardingStep
                  stepKey={guideSteps[currentGuideIdx].key}
                  title={guideSteps[currentGuideIdx].title}
                  body={guideSteps[currentGuideIdx].body}
                  isActive
                />
              )}
            </div>
            <DialogFooter className="flex-row gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
              <div className="flex gap-2">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </Button>
                )}
                <Button onClick={handleNext}>
                  {isLastStep ? 'Finish' : 'Next'}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
