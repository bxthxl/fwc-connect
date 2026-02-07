
-- Create notification type enum
CREATE TYPE public.notification_type AS ENUM ('announcement', 'weekly_song');

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  body text,
  reference_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
ON public.notifications
FOR SELECT
USING (user_id = get_profile_id(auth.uid()));

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = get_profile_id(auth.uid()))
WITH CHECK (user_id = get_profile_id(auth.uid()));

-- Users can delete own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (user_id = get_profile_id(auth.uid()));

-- Index for fast user queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Function to fan out notifications to all profiles
CREATE OR REPLACE FUNCTION public.notify_all_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _type notification_type;
  _title text;
  _body text;
  _ref_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'announcements' THEN
    _type := 'announcement';
    _title := 'New Announcement: ' || NEW.title;
    _body := left(NEW.body, 200);
    _ref_id := NEW.id;
  ELSIF TG_TABLE_NAME = 'weekly_songs' THEN
    _type := 'weekly_song';
    _title := 'New song assigned for the week of ' || NEW.week_start::text;
    _body := NULL;
    _ref_id := NEW.id;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, reference_id)
  SELECT p.id, _type, _title, _body, _ref_id
  FROM public.profiles p;

  RETURN NEW;
END;
$$;

-- Trigger: new announcement → notify all
CREATE TRIGGER trg_notify_announcement
AFTER INSERT ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.notify_all_users();

-- Trigger: new weekly song → notify all
CREATE TRIGGER trg_notify_weekly_song
AFTER INSERT ON public.weekly_songs
FOR EACH ROW
EXECUTE FUNCTION public.notify_all_users();
