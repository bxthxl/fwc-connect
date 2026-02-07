
-- Phase 3: Onboarding System
-- Add has_seen_onboarding to profiles
ALTER TABLE public.profiles ADD COLUMN has_seen_onboarding boolean NOT NULL DEFAULT false;

-- Create onboarding_content table
CREATE TABLE public.onboarding_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_content ENABLE ROW LEVEL SECURITY;

-- RLS: All authenticated users can read
CREATE POLICY "Authenticated users can read onboarding content"
ON public.onboarding_content FOR SELECT
TO authenticated
USING (true);

-- RLS: Only admins can modify
CREATE POLICY "Admins can create onboarding content"
ON public.onboarding_content FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update onboarding content"
ON public.onboarding_content FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete onboarding content"
ON public.onboarding_content FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_onboarding_content_updated_at
BEFORE UPDATE ON public.onboarding_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial onboarding content
INSERT INTO public.onboarding_content (key, title, body, sort_order) VALUES
  ('welcome_message', 'Welcome to FWC Worship Team!', 'We''re glad to have you on the team! This platform helps you stay connected with the worship team, track meetings, prepare songs, and more.', 0),
  ('guide_home', 'Home Dashboard', 'Your dashboard shows upcoming meetings, active announcements, birthday celebrations, and quick stats at a glance.', 1),
  ('guide_meetings', 'Meetings', 'View all scheduled worship team meetings, including dates, times, and locations. Never miss a rehearsal!', 2),
  ('guide_songs', 'Songs', 'Browse the song bank and check the Song of the Week to prepare ahead of worship sessions.', 3),
  ('guide_minutes', 'Meeting Minutes', 'Access published meeting minutes to review decisions and action items from past meetings.', 4),
  ('guide_profile', 'Your Profile', 'Keep your profile up to date with your voice group, contact information, and profile picture.', 5);

-- Phase 4: Discussion Board
-- Create discussion_topics table
CREATE TABLE public.discussion_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  is_pinned boolean NOT NULL DEFAULT false,
  is_locked boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.discussion_topics ENABLE ROW LEVEL SECURITY;

-- RLS for discussion_topics
CREATE POLICY "Authenticated users can read discussion topics"
ON public.discussion_topics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create discussion topics"
ON public.discussion_topics FOR INSERT
TO authenticated
WITH CHECK (created_by = get_profile_id(auth.uid()));

CREATE POLICY "Users can update own topics or admin can update any"
ON public.discussion_topics FOR UPDATE
TO authenticated
USING (created_by = get_profile_id(auth.uid()) OR is_admin(auth.uid()))
WITH CHECK (created_by = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Users can delete own topics or admin can delete any"
ON public.discussion_topics FOR DELETE
TO authenticated
USING (created_by = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_discussion_topics_updated_at
BEFORE UPDATE ON public.discussion_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create discussion_replies table
CREATE TABLE public.discussion_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id uuid NOT NULL REFERENCES public.discussion_topics(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

-- RLS for discussion_replies
CREATE POLICY "Authenticated users can read discussion replies"
ON public.discussion_replies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create replies on unlocked topics"
ON public.discussion_replies FOR INSERT
TO authenticated
WITH CHECK (
  created_by = get_profile_id(auth.uid()) 
  AND EXISTS (
    SELECT 1 FROM public.discussion_topics t 
    WHERE t.id = topic_id AND t.is_locked = false
  )
);

CREATE POLICY "Users can update own replies or admin can update any"
ON public.discussion_replies FOR UPDATE
TO authenticated
USING (created_by = get_profile_id(auth.uid()) OR is_admin(auth.uid()))
WITH CHECK (created_by = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Users can delete own replies or admin can delete any"
ON public.discussion_replies FOR DELETE
TO authenticated
USING (created_by = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_discussion_replies_updated_at
BEFORE UPDATE ON public.discussion_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Allow admins to also insert replies on locked topics
CREATE POLICY "Admins can create replies on any topic"
ON public.discussion_replies FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) AND created_by = get_profile_id(auth.uid())
);

-- Add profiles SELECT policy so all authenticated users can see each other's names (needed for discussions)
CREATE POLICY "Authenticated users can read all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive SELECT policy on profiles since the new one is more permissive
DROP POLICY IF EXISTS "Users can read own profile or admin reads all" ON public.profiles;
