export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          branch_id: string | null
          created_at: string
          created_by: string | null
          id: string
          title: string
          updated_at: string
          visible_from: string
          visible_to: string
        }
        Insert: {
          body: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
          updated_at?: string
          visible_from?: string
          visible_to: string
        }
        Update: {
          body?: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string
          visible_from?: string
          visible_to?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          created_at: string
          id: string
          marked_at: string
          marked_by: string | null
          meeting_id: string
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          marked_at?: string
          marked_by?: string | null
          meeting_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          marked_at?: string
          marked_by?: string | null
          meeting_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          pastor_name: string | null
          pastor_phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          pastor_name?: string | null
          pastor_phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          pastor_name?: string | null
          pastor_phone?: string | null
        }
        Relationships: []
      }
      church_roles: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      discussion_replies: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by: string
          id?: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "discussion_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_topics: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          is_locked: boolean
          is_pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_topics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_bgvs: {
        Row: {
          created_at: string
          event_id: string
          id: string
          member_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          member_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_bgvs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_bgvs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          dress_code: string | null
          end_time: string | null
          event_date: string
          id: string
          location: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dress_code?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          location: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dress_code?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          location?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string
          meeting_date: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location: string
          meeting_date: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string
          meeting_date?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_church_roles: {
        Row: {
          church_role_id: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          church_role_id: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          church_role_id?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_church_roles_church_role_id_fkey"
            columns: ["church_role_id"]
            isOneToOne: false
            referencedRelation: "church_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_church_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      minutes: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          meeting_id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meeting_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meeting_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "minutes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "minutes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: true
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          reference_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          reference_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_content: {
        Row: {
          body: string
          created_at: string
          id: string
          is_active: boolean
          key: string
          sort_order: number
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          sort_order?: number
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          sort_order?: number
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_content_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string
          avatar_url: string | null
          birthday: string
          branch_id: string | null
          care_group_leader_name: string
          care_group_leader_phone: string
          created_at: string
          email: string
          full_name: string
          has_seen_onboarding: boolean
          id: string
          phone: string | null
          primary_instrument:
            | Database["public"]["Enums"]["instrument_type"]
            | null
          residence: string
          secondary_instrument:
            | Database["public"]["Enums"]["instrument_type"]
            | null
          updated_at: string
          voice_group: Database["public"]["Enums"]["voice_group"]
          year_joined: number
        }
        Insert: {
          auth_user_id: string
          avatar_url?: string | null
          birthday: string
          branch_id?: string | null
          care_group_leader_name: string
          care_group_leader_phone: string
          created_at?: string
          email: string
          full_name: string
          has_seen_onboarding?: boolean
          id?: string
          phone?: string | null
          primary_instrument?:
            | Database["public"]["Enums"]["instrument_type"]
            | null
          residence: string
          secondary_instrument?:
            | Database["public"]["Enums"]["instrument_type"]
            | null
          updated_at?: string
          voice_group: Database["public"]["Enums"]["voice_group"]
          year_joined: number
        }
        Update: {
          auth_user_id?: string
          avatar_url?: string | null
          birthday?: string
          branch_id?: string | null
          care_group_leader_name?: string
          care_group_leader_phone?: string
          created_at?: string
          email?: string
          full_name?: string
          has_seen_onboarding?: boolean
          id?: string
          phone?: string | null
          primary_instrument?:
            | Database["public"]["Enums"]["instrument_type"]
            | null
          residence?: string
          secondary_instrument?:
            | Database["public"]["Enums"]["instrument_type"]
            | null
          updated_at?: string
          voice_group?: Database["public"]["Enums"]["voice_group"]
          year_joined?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          artist: string | null
          audio_url: string | null
          category: Database["public"]["Enums"]["song_category"] | null
          created_at: string
          created_by: string | null
          id: string
          lyrics: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          artist?: string | null
          audio_url?: string | null
          category?: Database["public"]["Enums"]["song_category"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          lyrics?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          artist?: string | null
          audio_url?: string | null
          category?: Database["public"]["Enums"]["song_category"] | null
          created_at?: string
          created_by?: string | null
          id?: string
          lyrics?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_songs: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          notes: string | null
          song_id: string
          song_type: Database["public"]["Enums"]["song_category"]
          updated_at: string
          week_start: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          song_id: string
          song_type: Database["public"]["Enums"]["song_category"]
          updated_at?: string
          week_start: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          song_id?: string
          song_type?: Database["public"]["Enums"]["song_category"]
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_songs_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_minutes: { Args: { auth_uid: string }; Returns: boolean }
      can_take_attendance: { Args: { auth_uid: string }; Returns: boolean }
      get_profile_id: { Args: { auth_uid: string }; Returns: string }
      get_user_branch_id: { Args: { auth_uid: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { auth_uid: string }; Returns: boolean }
      is_attendance_taker: { Args: { auth_uid: string }; Returns: boolean }
      is_minutes_taker: { Args: { auth_uid: string }; Returns: boolean }
      is_super_admin: { Args: { auth_uid: string }; Returns: boolean }
      notify_birthdays: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "attendance_taker" | "minutes_taker" | "super_admin"
      attendance_status: "present" | "absent" | "excused"
      instrument_type:
        | "bass_guitar"
        | "drum"
        | "keyboards"
        | "saxophones"
        | "violin"
        | "electric_guitar"
        | "electric_keyboard"
        | "conga_drums"
        | "flute"
        | "talking_drums"
      notification_type: "announcement" | "weekly_song" | "birthday"
      song_category: "praise_worship" | "friday_special" | "sunday_special"
      voice_group: "soprano" | "alto" | "tenor" | "bass" | "instrumentalist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "attendance_taker", "minutes_taker", "super_admin"],
      attendance_status: ["present", "absent", "excused"],
      instrument_type: [
        "bass_guitar",
        "drum",
        "keyboards",
        "saxophones",
        "violin",
        "electric_guitar",
        "electric_keyboard",
        "conga_drums",
        "flute",
        "talking_drums",
      ],
      notification_type: ["announcement", "weekly_song", "birthday"],
      song_category: ["praise_worship", "friday_special", "sunday_special"],
      voice_group: ["soprano", "alto", "tenor", "bass", "instrumentalist"],
    },
  },
} as const
