
-- Song category enum
CREATE TYPE public.song_category AS ENUM ('praise_worship', 'friday_special', 'sunday_special');

-- Songs table (the song bank)
CREATE TABLE public.songs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  artist text,
  lyrics text,
  audio_url text,
  video_url text,
  category song_category,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Weekly songs assignment table
CREATE TABLE public.weekly_songs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  song_type song_category NOT NULL,
  notes text,
  assigned_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(week_start, song_type)
);

-- Enable RLS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_songs ENABLE ROW LEVEL SECURITY;

-- Songs RLS: everyone can read, admins can CRUD
CREATE POLICY "Authenticated users can read songs"
ON public.songs FOR SELECT
USING (true);

CREATE POLICY "Admins can create songs"
ON public.songs FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update songs"
ON public.songs FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete songs"
ON public.songs FOR DELETE
USING (is_admin(auth.uid()));

-- Weekly songs RLS: everyone can read, admins can CRUD
CREATE POLICY "Authenticated users can read weekly songs"
ON public.weekly_songs FOR SELECT
USING (true);

CREATE POLICY "Admins can create weekly songs"
ON public.weekly_songs FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update weekly songs"
ON public.weekly_songs FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete weekly songs"
ON public.weekly_songs FOR DELETE
USING (is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_songs_updated_at
BEFORE UPDATE ON public.weekly_songs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
