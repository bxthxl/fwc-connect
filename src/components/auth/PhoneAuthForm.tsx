import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';
import fwcLogo from '@/assets/fwc-logo.png';

interface PhoneAuthFormProps {
  onAuthSuccess: () => void;
}

export function PhoneAuthForm({ onAuthSuccess }: PhoneAuthFormProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with + for international format
    if (!cleaned.startsWith('+')) {
      // Assume Nigerian number if no country code
      if (cleaned.startsWith('0')) {
        cleaned = '+234' + cleaned.slice(1);
      } else if (!cleaned.startsWith('234')) {
        cleaned = '+234' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }
    
    return cleaned;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast({
        title: 'Phone number required',
        description: 'Please enter your phone number.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phone);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        throw error;
      }

      setStep('otp');
      toast({
        title: 'OTP Sent',
        description: 'Please check your phone for the verification code.',
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit code.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phone);

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Welcome!',
        description: 'You have been signed in successfully.',
      });
      onAuthSuccess();
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(phone);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'OTP Resent',
        description: 'A new code has been sent to your phone.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend OTP.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <img 
              src={fwcLogo} 
              alt="FWC Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to FWC</CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'Enter your phone number to sign in or create an account'
                : 'Enter the verification code sent to your phone'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Include your country code (e.g., +234 for Nigeria)
                </p>
              </div>
              <Button type="submit" className="w-full touch-target" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-center block">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Code sent to {phone}
                </p>
              </div>
              <div className="space-y-2">
                <Button type="submit" className="w-full touch-target" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Verify & Sign In'
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setStep('phone')}
                    disabled={isLoading}
                  >
                    Change Number
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
