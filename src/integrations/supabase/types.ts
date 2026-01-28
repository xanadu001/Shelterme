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
      bookings: {
        Row: {
          created_at: string
          id: string
          inspection_date: string | null
          inspection_notes: string | null
          inspection_status: string | null
          listing_id: string
          move_in_date: string
          payment_reference: string | null
          payment_status: string
          rent_amount: number
          service_fee: number
          student_email: string
          student_name: string
          student_phone: string
          total_amount: number
          university: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inspection_date?: string | null
          inspection_notes?: string | null
          inspection_status?: string | null
          listing_id: string
          move_in_date: string
          payment_reference?: string | null
          payment_status?: string
          rent_amount: number
          service_fee: number
          student_email: string
          student_name: string
          student_phone: string
          total_amount: number
          university: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inspection_date?: string | null
          inspection_notes?: string | null
          inspection_status?: string | null
          listing_id?: string
          move_in_date?: string
          payment_reference?: string | null
          payment_status?: string
          rent_amount?: number
          service_fee?: number
          student_email?: string
          student_name?: string
          student_phone?: string
          total_amount?: number
          university?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          university: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          phone: string
          university: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          university?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: string[] | null
          bathrooms: number
          bedrooms: number
          created_at: string
          description: string
          id: string
          images: string[] | null
          inquiries_count: number | null
          is_available: boolean | null
          is_verified: boolean | null
          location: string
          owner_id: string
          period: string
          price: number
          size: string | null
          title: string
          university: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          inquiries_count?: number | null
          is_available?: boolean | null
          is_verified?: boolean | null
          location: string
          owner_id: string
          period?: string
          price: number
          size?: string | null
          title: string
          university: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          inquiries_count?: number | null
          is_available?: boolean | null
          is_verified?: boolean | null
          location?: string
          owner_id?: string
          period?: string
          price?: number
          size?: string | null
          title?: string
          university?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          company_name: string | null
          created_at: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          verified: boolean | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          verified?: boolean | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "landlord" | "agent" | "admin"
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
      app_role: ["student", "landlord", "agent", "admin"],
    },
  },
} as const
