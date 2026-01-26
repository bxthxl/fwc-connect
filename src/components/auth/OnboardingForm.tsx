import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Music, User, MapPin, Phone } from 'lucide-react';
import { VoiceGroup, InstrumentType, VOICE_GROUP_LABELS, INSTRUMENT_LABELS, VOICE_GROUPS, INSTRUMENTS } from '@/types/database';
import fwcLogo from '@/assets/fwc-logo.png';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

const onboardingSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional().or(z.literal('')),
  residence: z.string().min(5, 'Please enter your full address'),
  birthday: z.date({ required_error: 'Birthday is required' }),
  year_joined: z.number().min(1950).max(currentYear),
  voice_group: z.enum(['soprano', 'alto', 'tenor', 'bass', 'instrumentalist'] as const),
  primary_instrument: z.enum(['bass_guitar', 'drum', 'keyboards', 'saxophones', 'violin', 'electric_guitar', 'electric_keyboard', 'conga_drums', 'flute', 'talking_drums'] as const).optional(),
  secondary_instrument: z.enum(['bass_guitar', 'drum', 'keyboards', 'saxophones', 'violin', 'electric_guitar', 'electric_keyboard', 'conga_drums', 'flute', 'talking_drums'] as const).optional(),
  care_group_leader_name: z.string().min(2, 'Leader name is required'),
  care_group_leader_phone: z.string().min(10, 'Valid phone number is required'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  onComplete: () => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      residence: '',
      year_joined: currentYear,
      voice_group: undefined,
      care_group_leader_name: '',
      care_group_leader_phone: '',
    },
  });

  const voiceGroup = form.watch('voice_group');
  const isInstrumentalist = voiceGroup === 'instrumentalist';

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to complete registration.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('profiles').insert({
        auth_user_id: user.id,
        full_name: data.full_name,
        phone: data.phone || null,
        email: user.email || '',
        residence: data.residence,
        birthday: format(data.birthday, 'yyyy-MM-dd'),
        year_joined: data.year_joined,
        voice_group: data.voice_group,
        primary_instrument: isInstrumentalist ? data.primary_instrument : null,
        secondary_instrument: isInstrumentalist ? data.secondary_instrument : null,
        care_group_leader_name: data.care_group_leader_name,
        care_group_leader_phone: data.care_group_leader_phone,
      });

      if (error) {
        throw error;
      }

      await refreshProfile();
      
      toast({
        title: 'Welcome to FWC!',
        description: 'Your profile has been created successfully.',
      });
      
      onComplete();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ['full_name', 'phone', 'residence', 'birthday', 'year_joined'] as const
      : ['voice_group', ...(isInstrumentalist ? ['primary_instrument'] : []), 'care_group_leader_name', 'care_group_leader_phone'] as const;
    
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <img src={fwcLogo} alt="FWC Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Step {step} of 2: {step === 1 ? 'Personal Information' : 'Ministry Details'}
            </CardDescription>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="John Doe" className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="tel" placeholder="+234 XXX XXX XXXX" className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="residence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residence / Address *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Textarea {...field} placeholder="Your full address" className="pl-10 min-h-[80px]" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="birthday"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Birthday *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : "Pick a date"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="year_joined"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Joined *</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="button" className="w-full touch-target" onClick={nextStep}>
                    Continue
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="voice_group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Section / Group *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VOICE_GROUPS.map((group) => (
                              <SelectItem key={group} value={group}>
                                {VOICE_GROUP_LABELS[group]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isInstrumentalist && (
                    <>
                      <FormField
                        control={form.control}
                        name="primary_instrument"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Instrument *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <Music className="mr-2 h-4 w-4" />
                                  <SelectValue placeholder="Select instrument" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {INSTRUMENTS.map((instrument) => (
                                  <SelectItem key={instrument} value={instrument}>
                                    {INSTRUMENT_LABELS[instrument]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="secondary_instrument"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Instrument (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <Music className="mr-2 h-4 w-4" />
                                  <SelectValue placeholder="Select instrument" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {INSTRUMENTS.map((instrument) => (
                                  <SelectItem key={instrument} value={instrument}>
                                    {INSTRUMENT_LABELS[instrument]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Care Group Leader Information</p>
                    
                    <FormField
                      control={form.control}
                      name="care_group_leader_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leader's Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Care Group Leader Name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="care_group_leader_phone"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Leader's Phone *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="tel" placeholder="+234 XXX XXX XXXX" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 touch-target" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Complete Registration'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
