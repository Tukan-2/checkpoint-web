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
          booking_date: string
          booking_time: string
          branch_id: string
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          license_plate: string | null
          notes: string | null
          service_name: string
          status: string | null
          vehicle_group_id: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          branch_id: string
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          license_plate?: string | null
          notes?: string | null
          service_name: string
          status?: string | null
          vehicle_group_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          branch_id?: string
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          license_plate?: string | null
          notes?: string | null
          service_name?: string
          status?: string | null
          vehicle_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_group_id_fkey"
            columns: ["vehicle_group_id"]
            isOneToOne: false
            referencedRelation: "vehicle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_prices: {
        Row: {
          branch_id: string
          description: string | null
          id: string
          price: number
          service_name: string
          vehicle_group_id: string
        }
        Insert: {
          branch_id: string
          description?: string | null
          id?: string
          price: number
          service_name: string
          vehicle_group_id: string
        }
        Update: {
          branch_id?: string
          description?: string | null
          id?: string
          price?: number
          service_name?: string
          vehicle_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_prices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_prices_vehicle_group_id_fkey"
            columns: ["vehicle_group_id"]
            isOneToOne: false
            referencedRelation: "vehicle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_vehicle_groups: {
        Row: {
          branch_id: string
          id: string
          vehicle_group_id: string
        }
        Insert: {
          branch_id: string
          id?: string
          vehicle_group_id: string
        }
        Update: {
          branch_id?: string
          id?: string
          vehicle_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_vehicle_groups_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_vehicle_groups_vehicle_group_id_fkey"
            columns: ["vehicle_group_id"]
            isOneToOne: false
            referencedRelation: "vehicle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          city: string
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          map_embed_url: string | null
          name: string
          opening_hours: Json | null
          phone: string | null
          postal_code: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          map_embed_url?: string | null
          name: string
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          map_embed_url?: string | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicle_groups: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
