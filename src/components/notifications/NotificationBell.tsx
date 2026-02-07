import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Megaphone, Music, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  Notification,
} from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

function NotificationIcon({ type }: { type: Notification['type'] }) {
  if (type === 'announcement') return <Megaphone className="h-4 w-4 text-primary shrink-0" />;
  return <Music className="h-4 w-4 text-accent-foreground shrink-0" />;
}

function NotificationItem({
  notification,
  onMarkRead,
  onNavigate,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onNavigate: (n: Notification) => void;
}) {
  return (
    <button
      onClick={() => {
        if (!notification.is_read) onMarkRead(notification.id);
        onNavigate(notification);
      }}
      className={cn(
        'w-full flex items-start gap-3 p-3 text-left rounded-lg transition-colors hover:bg-muted/60',
        !notification.is_read && 'bg-primary/5'
      )}
    >
      <NotificationIcon type={notification.type} />
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={cn('text-sm leading-tight', !notification.is_read && 'font-semibold')}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notification.is_read && (
        <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleNavigate = (n: Notification) => {
    setOpen(false);
    if (n.type === 'announcement') navigate('/dashboard');
    else if (n.type === 'weekly_song') navigate('/songs');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[360px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="p-1 space-y-0.5">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markAsRead.mutate(id)}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
