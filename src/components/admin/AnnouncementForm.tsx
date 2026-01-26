import { useState } from 'react';
import { Announcement } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DatePickerWithDropdowns } from '@/components/ui/date-picker-with-dropdowns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSubmit: (data: {
    title: string;
    body: string;
    visible_from: string;
    visible_to: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AnnouncementForm({ announcement, onSubmit, onCancel, isLoading }: AnnouncementFormProps) {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    body: announcement?.body || '',
    visible_from: announcement?.visible_from || new Date().toISOString(),
    visible_to: announcement?.visible_to || addDays(new Date(), 7).toISOString(),
  });

  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{announcement ? 'Edit Announcement' : 'Create Announcement'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Announcement title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Write your announcement..."
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Visible From</Label>
              <Popover open={fromPickerOpen} onOpenChange={setFromPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(formData.visible_from), 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DatePickerWithDropdowns
                    selected={new Date(formData.visible_from)}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, visible_from: date.toISOString() });
                        setFromPickerOpen(false);
                      }
                    }}
                    fromYear={new Date().getFullYear()}
                    toYear={new Date().getFullYear() + 2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Visible Until</Label>
              <Popover open={toPickerOpen} onOpenChange={setToPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(formData.visible_to), 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DatePickerWithDropdowns
                    selected={new Date(formData.visible_to)}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, visible_to: date.toISOString() });
                        setToPickerOpen(false);
                      }
                    }}
                    fromYear={new Date().getFullYear()}
                    toYear={new Date().getFullYear() + 2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {announcement ? 'Update' : 'Create'} Announcement
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
