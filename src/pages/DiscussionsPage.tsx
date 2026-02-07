import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import {
  useDiscussionTopics,
  useDiscussionReplies,
  useCreateTopic,
  useCreateReply,
  useTogglePinTopic,
  useToggleLockTopic,
  useDeleteTopic,
  useDeleteReply,
  DiscussionTopic,
} from '@/hooks/useDiscussions';
import {
  MessageSquare,
  Plus,
  Pin,
  Lock,
  Unlock,
  Trash2,
  MoreVertical,
  Send,
  MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';

function NewTopicForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const createTopic = useCreateTopic();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    createTopic.mutate(
      { title: title.trim(), body: body.trim() },
      { onSuccess: onClose }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Topic title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="What would you like to discuss?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        required
      />
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createTopic.isPending}>
          Create Topic
        </Button>
      </DialogFooter>
    </form>
  );
}

function TopicDetail({
  topic,
  onClose,
}: {
  topic: DiscussionTopic;
  onClose: () => void;
}) {
  const { profile, isAdmin } = useAuth();
  const { data: replies, isLoading } = useDiscussionReplies(topic.id);
  const createReply = useCreateReply();
  const deleteReply = useDeleteReply();
  const [replyText, setReplyText] = useState('');

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    createReply.mutate(
      { topicId: topic.id, body: replyText.trim() },
      { onSuccess: () => setReplyText('') }
    );
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
      <DialogHeader>
        <div className="flex items-center gap-2">
          {topic.is_pinned && <Pin className="h-4 w-4 text-[hsl(var(--accent))]" />}
          {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
          <DialogTitle>{topic.title}</DialogTitle>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{topic.profiles?.full_name}</span>
          <span>·</span>
          <span>{format(new Date(topic.created_at), 'MMM d, yyyy')}</span>
        </div>
      </DialogHeader>

      <div className="border-b pb-4">
        <p className="whitespace-pre-wrap text-sm">{topic.body}</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 py-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading replies…</p>
        ) : replies && replies.length > 0 ? (
          replies.map((reply) => (
            <div key={reply.id} className="flex gap-3 group">
              <Avatar className="h-8 w-8 shrink-0">
                {reply.profiles?.avatar_url && (
                  <AvatarImage src={reply.profiles.avatar_url} />
                )}
                <AvatarFallback className="text-xs bg-muted">
                  {reply.profiles?.full_name ? getInitials(reply.profiles.full_name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{reply.profiles?.full_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(reply.created_at), 'MMM d, h:mm a')}
                  </span>
                  {(reply.created_by === profile?.id || isAdmin) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => deleteReply.mutate({ id: reply.id, topicId: topic.id })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{reply.body}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No replies yet. Be the first to respond!
          </p>
        )}
      </div>

      {!topic.is_locked && (
        <form onSubmit={handleReply} className="flex gap-2 pt-2 border-t">
          <Input
            placeholder="Write a reply…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={createReply.isPending || !replyText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
      {topic.is_locked && (
        <p className="text-sm text-muted-foreground text-center py-2 border-t">
          🔒 This topic is locked. No new replies can be added.
        </p>
      )}
    </DialogContent>
  );
}

export default function DiscussionsPage() {
  const { isAdmin, profile } = useAuth();
  const { data: topics, isLoading } = useDiscussionTopics();
  const togglePin = useTogglePinTopic();
  const toggleLock = useToggleLockTopic();
  const deleteTopic = useDeleteTopic();
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(null);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              Discussions
            </h1>
            <p className="text-muted-foreground">Chat and share with the worship team</p>
          </div>
          <Button onClick={() => setShowNewTopic(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Topic
          </Button>
        </div>

        {!topics || topics.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No discussions yet"
            description="Start a new topic to get the conversation going!"
          />
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <Card
                key={topic.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTopic(topic)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    {topic.profiles?.avatar_url && (
                      <AvatarImage src={topic.profiles.avatar_url} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {topic.profiles?.full_name
                        ? getInitials(topic.profiles.full_name)
                        : '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {topic.is_pinned && <Pin className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />}
                      {topic.is_locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                      <h3 className="font-semibold truncate">{topic.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{topic.body}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{topic.profiles?.full_name}</span>
                      <span>·</span>
                      <span>{format(new Date(topic.updated_at), 'MMM d')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="secondary" className="gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {topic.reply_count || 0}
                    </Badge>

                    {(isAdmin || topic.created_by === profile?.id) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          {isAdmin && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  togglePin.mutate({
                                    id: topic.id,
                                    is_pinned: !topic.is_pinned,
                                  })
                                }
                              >
                                <Pin className="mr-2 h-4 w-4" />
                                {topic.is_pinned ? 'Unpin' : 'Pin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleLock.mutate({
                                    id: topic.id,
                                    is_locked: !topic.is_locked,
                                  })
                                }
                              >
                                {topic.is_locked ? (
                                  <Unlock className="mr-2 h-4 w-4" />
                                ) : (
                                  <Lock className="mr-2 h-4 w-4" />
                                )}
                                {topic.is_locked ? 'Unlock' : 'Lock'}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteTopic.mutate(topic.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Topic Dialog */}
      <Dialog open={showNewTopic} onOpenChange={setShowNewTopic}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Discussion Topic</DialogTitle>
          </DialogHeader>
          <NewTopicForm onClose={() => setShowNewTopic(false)} />
        </DialogContent>
      </Dialog>

      {/* Topic Detail Dialog */}
      {selectedTopic && (
        <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
          <TopicDetail topic={selectedTopic} onClose={() => setSelectedTopic(null)} />
        </Dialog>
      )}
    </DashboardLayout>
  );
}
