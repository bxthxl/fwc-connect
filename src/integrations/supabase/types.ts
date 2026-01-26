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
      meetings: {
        Row: {
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
            foreignKeyName: "meetings_created_by_fkey"
            columns: ["created_by"]
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
      profiles: {
        Row: {
          auth_user_id: string
          birthday: string
          care_group_leader_name: string
          care_group_leader_phone: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string
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
          birthday: string
          care_group_leader_name: string
          care_group_leader_phone: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone: string
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
          birthday?: string
          care_group_leader_name?: string
          care_group_leader_phone?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
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
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_minutes: { Args: { auth_uid: string }; Returns: boolean }
      can_take_attendance: { Args: { auth_uid: string }; Returns: boolean }
      get_profile_id: { Args: { auth_uid: string }; Returns: string }
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
    }
    Enums: {
      app_role: "admin" | "attendance_taker" | "minutes_taker"
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
      app_role: ["admin", "attendance_taker", "minutes_taker"],
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
      voice_group: ["soprano", "alto", "tenor", "bass", "instrumentalist"],
    },
  },
} as const
