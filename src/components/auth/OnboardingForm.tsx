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
import { DatePickerWithDropdowns } from '@/components/ui/date-picker-with-dropdowns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Music, User, MapPin, Phone } from 'lucide-react';
import { VoiceGroup, InstrumentType, VOICE_GROUP_LABELS, INSTRUMENT_LABELS, VOICE_GROUPS, INSTRUMENTS } from '@/types/database';
import { useBranches } from '@/hooks/useBranches';
import { useChurchRoles, useSetMemberChurchRoles } from '@/hooks/useChurchRoles';
import fwcLogo from '@/assets/fwc-logo.png';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

const onboardingSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional().or(z.literal('')).refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      const cleaned = val.replace(/[\s\-().]/g, '');
      return /^(?:\+?234|0)[789]\d{9}$/.test(cleaned);
    },
    { message: 'Please enter a valid Nigerian phone number (e.g. +2348012345678 or 08012345678)' }
  ),
  residence: z.string().min(5, 'Please enter your full address'),
  birthday: z.date({ required_error: 'Birthday is required' }),
  year_joined: z.number().min(1950).max(currentYear),
  voice_group: z.enum(['soprano', 'alto', 'tenor', 'bass', 'instrumentalist'] as const),
  primary_instrument: z.enum(['bass_guitar', 'drum', 'keyboards', 'saxophones', 'violin', 'electric_guitar', 'electric_keyboard', 'conga_drums', 'flute', 'talking_drums'] as const).optional(),
  secondary_instrument: z.enum(['bass_guitar', 'drum', 'keyboards', 'saxophones', 'violin', 'electric_guitar', 'electric_keyboard', 'conga_drums', 'flute', 'talking_drums'] as const).optional(),
  care_group_leader_name: z.string().min(2, 'Leader name is required'),
  care_group_leader_phone: z.string().min(10, 'Valid phone number is required'),
  branch_id: z.string().min(1, 'Please select your branch'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  onComplete: () => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const { user, refreshProfile } = useAuth();
  const { data: branches } = useBranches();
  const { data: churchRoles } = useChurchRoles();
  const setMemberChurchRoles = useSetMemberChurchRoles();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedChurchRoles, setSelectedChurchRoles] = useState<string[]>([]);

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
      branch_id: '',
    },
  });

  const voiceGroup = form.watch('voice_group');
  const isInstrumentalist = voiceGroup === 'instrumentalist';

  const toggleChurchRole = (id: string) => {
    setSelectedChurchRoles(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be signed in.', variant: 'destructive' });
      return;
    }
    // Church roles are optional - choir members can skip

    setIsLoading(true);
    try {
      const { data: profileData, error } = await supabase.from('profiles').insert({
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
        branch_id: data.branch_id,
      }).select().single();

      if (error) throw error;

      // Set church roles
      if (profileData && selectedChurchRoles.length > 0) {
        await setMemberChurchRoles.mutateAsync({ profileId: profileData.id, roleIds: selectedChurchRoles });
      }

      await refreshProfile();
      toast({ title: 'Welcome to FWC Worship Team!', description: 'Your profile has been created successfully.' });
      onComplete();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({ title: 'Error', description: error.message || 'Failed to create profile.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = 3;

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await form.trigger(['full_name', 'phone', 'residence', 'birthday', 'year_joined', 'branch_id'] as any);
      if (isValid) setStep(2);
    } else if (step === 2) {
      const fieldsToValidate = ['voice_group', ...(isInstrumentalist ? ['primary_instrument'] : []), 'care_group_leader_name', 'care_group_leader_phone'] as const;
      const isValid = await form.trigger(fieldsToValidate as any);
      if (isValid) setStep(3);
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
              Step {step} of {totalSteps}: {step === 1 ? 'Personal Information' : step === 2 ? 'Ministry Details' : 'Church Roles'}
            </CardDescription>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                <>
                  <FormField control={form.control} name="full_name" render={({ field }) => (
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
                  )} />

                  <FormField control={form.control} name="phone" render={({ field }) => (
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
                  )} />

                  <FormField control={form.control} name="branch_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>FWC Branch *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your branch" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <ScrollArea className="h-60">
                            {(branches || []).map(b => (
                              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="residence" render={({ field }) => (
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
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="birthday" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Birthday *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <DatePickerWithDropdowns selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1920-01-01")} toYear={new Date().getFullYear()} fromYear={1920} />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="year_joined" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Joined *</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger></FormControl>
                          <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <Button type="button" className="w-full touch-target" onClick={nextStep}>Continue</Button>
                </>
              )}

              {step === 2 && (
                <>
                  <FormField control={form.control} name="voice_group" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Section / Group *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select your group" /></SelectTrigger></FormControl>
                        <SelectContent>{VOICE_GROUPS.map(g => <SelectItem key={g} value={g}>{VOICE_GROUP_LABELS[g]}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {isInstrumentalist && (
                    <>
                      <FormField control={form.control} name="primary_instrument" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Instrument *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><Music className="mr-2 h-4 w-4" /><SelectValue placeholder="Select instrument" /></SelectTrigger></FormControl>
                            <SelectContent>{INSTRUMENTS.map(i => <SelectItem key={i} value={i}>{INSTRUMENT_LABELS[i]}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="secondary_instrument" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Instrument (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><Music className="mr-2 h-4 w-4" /><SelectValue placeholder="Select instrument" /></SelectTrigger></FormControl>
                            <SelectContent>{INSTRUMENTS.map(i => <SelectItem key={i} value={i}>{INSTRUMENT_LABELS[i]}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Care Group Leader Information</p>
                    <FormField control={form.control} name="care_group_leader_name" render={({ field }) => (
                      <FormItem><FormLabel>Leader's Name *</FormLabel><FormControl><Input {...field} placeholder="Care Group Leader Name" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="care_group_leader_phone" render={({ field }) => (
                      <FormItem className="mt-4"><FormLabel>Leader's Phone *</FormLabel><FormControl>
                        <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input {...field} type="tel" placeholder="+234 XXX XXX XXXX" className="pl-10" /></div>
                      </FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                    <Button type="button" className="flex-1 touch-target" onClick={nextStep}>Continue</Button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                     <Label className="text-sm font-medium">Church Roles (Optional)</Label>
                     <p className="text-xs text-muted-foreground">Select any roles that apply, or skip if you're just a choir member.</p>
                    <div className="border rounded-md p-3 space-y-2 max-h-56 overflow-y-auto">
                      {(churchRoles || []).map(role => (
                        <label key={role.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded p-1.5">
                          <Checkbox checked={selectedChurchRoles.includes(role.id)} onCheckedChange={() => toggleChurchRole(role.id)} />
                          <span className="text-sm">{role.name}</span>
                        </label>
                      ))}
                    </div>
                    {selectedChurchRoles.length > 0 && <p className="text-xs text-muted-foreground">{selectedChurchRoles.length} role(s) selected</p>}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                    <Button type="submit" className="flex-1 touch-target" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete Registration'}
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
