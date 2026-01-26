-- Create enums for voice groups, instruments, attendance status, and roles
CREATE TYPE public.voice_group AS ENUM ('soprano', 'alto', 'tenor', 'bass', 'instrumentalist');

CREATE TYPE public.instrument_type AS ENUM (
  'bass_guitar', 'drum', 'keyboards', 'saxophones', 'violin', 
  'electric_guitar', 'electric_keyboard', 'conga_drums', 'flute', 'talking_drums'
);

CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'excused');

CREATE TYPE public.app_role AS ENUM ('admin', 'attendance_taker', 'minutes_taker');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  residence TEXT NOT NULL,
  birthday DATE NOT NULL,
  year_joined INTEGER NOT NULL,
  voice_group public.voice_group NOT NULL,
  primary_instrument public.instrument_type,
  secondary_instrument public.instrument_type,
  care_group_leader_name TEXT NOT NULL,
  care_group_leader_phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- USER ROLES TABLE (Separate for security)
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ============================================
-- MEETINGS TABLE
-- ============================================
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status public.attendance_status NOT NULL DEFAULT 'absent',
  marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  marked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (meeting_id, user_id)
);

-- ============================================
-- MINUTES TABLE
-- ============================================
CREATE TABLE public.minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  visible_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  visible_to TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- HELPER FUNCTIONS (Security Definer to avoid RLS recursion)
-- ============================================

-- Get profile ID from auth user ID
CREATE OR REPLACE FUNCTION public.get_profile_id(auth_uid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE auth_user_id = auth_uid LIMIT 1
$$;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if auth user is admin
CREATE OR REPLACE FUNCTION public.is_admin(auth_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.auth_user_id = auth_uid AND ur.role = 'admin'
  )
$$;

-- Check if auth user is attendance taker
CREATE OR REPLACE FUNCTION public.is_attendance_taker(auth_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.auth_user_id = auth_uid AND ur.role = 'attendance_taker'
  )
$$;

-- Check if auth user is minutes taker
CREATE OR REPLACE FUNCTION public.is_minutes_taker(auth_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    INNER JOIN public.profiles p ON p.id = ur.user_id
    WHERE p.auth_user_id = auth_uid AND ur.role = 'minutes_taker'
  )
$$;

-- Check if auth user can take attendance (admin or attendance_taker)
CREATE OR REPLACE FUNCTION public.can_take_attendance(auth_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin(auth_uid) OR public.is_attendance_taker(auth_uid)
$$;

-- Check if auth user can manage minutes (admin or minutes_taker)
CREATE OR REPLACE FUNCTION public.can_manage_minutes(auth_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin(auth_uid) OR public.is_minutes_taker(auth_uid)
$$;

-- ============================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_minutes_updated_at
  BEFORE UPDATE ON public.minutes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: PROFILES
-- ============================================
-- Users can read their own profile, admins can read all
CREATE POLICY "Users can read own profile or admin reads all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can create own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: USER ROLES
-- ============================================
-- Only admins can read roles
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Only admins can insert roles
CREATE POLICY "Admins can create roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update roles
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can delete roles
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: MEETINGS
-- ============================================
-- All authenticated users can read meetings
CREATE POLICY "Authenticated users can read meetings"
  ON public.meetings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can create meetings
CREATE POLICY "Admins can create meetings"
  ON public.meetings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update meetings
CREATE POLICY "Admins can update meetings"
  ON public.meetings FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can delete meetings
CREATE POLICY "Admins can delete meetings"
  ON public.meetings FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: ATTENDANCE
-- ============================================
-- Admins and attendance takers can read attendance
CREATE POLICY "Admins and attendance takers can read attendance"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (public.can_take_attendance(auth.uid()));

-- Admins and attendance takers can insert attendance
CREATE POLICY "Admins and attendance takers can create attendance"
  ON public.attendance FOR INSERT
  TO authenticated
  WITH CHECK (public.can_take_attendance(auth.uid()));

-- Admins and attendance takers can update attendance
CREATE POLICY "Admins and attendance takers can update attendance"
  ON public.attendance FOR UPDATE
  TO authenticated
  USING (public.can_take_attendance(auth.uid()))
  WITH CHECK (public.can_take_attendance(auth.uid()));

-- Only admins can delete attendance
CREATE POLICY "Admins can delete attendance"
  ON public.attendance FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: MINUTES
-- ============================================
-- All authenticated users can read published minutes
CREATE POLICY "Users can read published minutes"
  ON public.minutes FOR SELECT
  TO authenticated
  USING (is_published = true OR public.can_manage_minutes(auth.uid()));

-- Admins and minutes takers can create minutes
CREATE POLICY "Admins and minutes takers can create minutes"
  ON public.minutes FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_minutes(auth.uid()));

-- Admins and minutes takers can update minutes
CREATE POLICY "Admins and minutes takers can update minutes"
  ON public.minutes FOR UPDATE
  TO authenticated
  USING (public.can_manage_minutes(auth.uid()))
  WITH CHECK (public.can_manage_minutes(auth.uid()));

-- Only admins can delete minutes
CREATE POLICY "Admins can delete minutes"
  ON public.minutes FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES: ANNOUNCEMENTS
-- ============================================
-- All authenticated users can read active announcements
CREATE POLICY "Users can read active announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (
    (visible_from <= now() AND visible_to >= now())
    OR public.is_admin(auth.uid())
  );

-- Only admins can create announcements
CREATE POLICY "Admins can create announcements"
  ON public.announcements FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update announcements
CREATE POLICY "Admins can update announcements"
  ON public.announcements FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can delete announcements
CREATE POLICY "Admins can delete announcements"
  ON public.announcements FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX idx_profiles_voice_group ON public.profiles(voice_group);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_meetings_date ON public.meetings(meeting_date);
CREATE INDEX idx_attendance_meeting_id ON public.attendance(meeting_id);
CREATE INDEX idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX idx_minutes_meeting_id ON public.minutes(meeting_id);
CREATE INDEX idx_announcements_visibility ON public.announcements(visible_from, visible_to);