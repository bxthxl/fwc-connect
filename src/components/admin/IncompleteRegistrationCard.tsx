import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, Send, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IncompleteUser {
  id: string;
  email: string;
  created_at: string;
}

interface IncompleteRegistrationCardProps {
  user: IncompleteUser;
}

export function IncompleteRegistrationCard({ user }: IncompleteRegistrationCardProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleSendLink = async () => {
    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-member`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ email: user.email }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error);
      toast({ title: 'Invite sent', description: `An invitation has been sent to ${user.email}` });
    } catch (error: any) {
      toast({ title: 'Failed to send link', description: error.message, variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-dashed border-warning/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                Incomplete
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>Signed up {format(parseISO(user.created_at), 'MMM d, yyyy')}</span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleSendLink} disabled={isSending}>
            {isSending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            <span className="ml-1.5 hidden sm:inline">Send Link</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}