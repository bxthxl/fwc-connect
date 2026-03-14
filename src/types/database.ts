// Custom type definitions for the FWC app
// These complement the auto-generated Supabase types

export type VoiceGroup = 'soprano' | 'alto' | 'tenor' | 'bass' | 'instrumentalist';

export type InstrumentType = 
  | 'bass_guitar' 
  | 'drum' 
  | 'keyboards' 
  | 'saxophones' 
  | 'violin' 
  | 'electric_guitar' 
  | 'electric_keyboard' 
  | 'conga_drums' 
  | 'flute' 
  | 'talking_drums';

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export type SongCategory = 'praise_worship' | 'friday_special' | 'sunday_special';

export type AppRole = 'admin' | 'super_admin' | 'attendance_taker' | 'minutes_taker';

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string | null;
  email: string;
  residence: string;
  birthday: string;
  year_joined: number;
  voice_group: VoiceGroup;
  primary_instrument: InstrumentType | null;
  secondary_instrument: InstrumentType | null;
  care_group_leader_name: string;
  care_group_leader_phone: string;
  avatar_url: string | null;
  has_seen_onboarding: boolean;
  branch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  start_time: string;
  location: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  meeting_id: string;
  user_id: string;
  status: AttendanceStatus;
  marked_by: string | null;
  marked_at: string;
  notes: string | null;
  created_at: string;
}

export interface Minutes {
  id: string;
  meeting_id: string;
  content: string;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  visible_from: string;
  visible_to: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingContent {
  id: string;
  key: string;
  title: string;
  body: string;
  sort_order: number;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiscussionTopic {
  id: string;
  title: string;
  body: string;
  created_by: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscussionReply {
  id: string;
  topic_id: string;
  body: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Form types for registration
export interface RegistrationFormData {
  full_name: string;
  phone?: string;
  email: string;
  residence: string;
  birthday: string;
  year_joined: number;
  voice_group: VoiceGroup;
  primary_instrument?: InstrumentType;
  secondary_instrument?: InstrumentType;
  care_group_leader_name: string;
  care_group_leader_phone: string;
}

// User context with roles
export interface UserWithRoles {
  profile: Profile;
  roles: AppRole[];
  isAdmin: boolean;
  canTakeAttendance: boolean;
  canManageMinutes: boolean;
}

// Display labels for enums
export const VOICE_GROUP_LABELS: Record<VoiceGroup, string> = {
  soprano: 'Soprano',
  alto: 'Alto',
  tenor: 'Tenor',
  bass: 'Bass',
  instrumentalist: 'Instrumentalist',
};

export const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  bass_guitar: 'Bass Guitar',
  drum: 'Drum',
  keyboards: 'Keyboards',
  saxophones: 'Saxophones',
  violin: 'Violin',
  electric_guitar: 'Electric Guitar',
  electric_keyboard: 'Electric Keyboard',
  conga_drums: 'Conga Drums',
  flute: 'Flute',
  talking_drums: 'Talking Drums',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  excused: 'Excused',
};

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'General Admin',
  admin: 'Branch Admin',
  attendance_taker: 'Attendance Taker',
  minutes_taker: 'Minutes Taker',
};

// Voice groups array for iteration
export const VOICE_GROUPS: VoiceGroup[] = ['soprano', 'alto', 'tenor', 'bass', 'instrumentalist'];

// Instruments array for iteration
export const INSTRUMENTS: InstrumentType[] = [
  'bass_guitar',
  'drum',
  'keyboards',
  'saxophones',
  'violin',
  'electric_guitar',
  'electric_keyboard',
  'conga_drums',
  'flute',
  'talking_drums',
];
