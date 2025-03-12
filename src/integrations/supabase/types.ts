export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      electricity_readings: {
        Row: {
          consumption: number
          created_at: string
          current_date_reading: string
          current_reading: number
          daily_consumption: number
          estimated_cost: number
          flag_type: string
          flag_value: number
          id: string
          kwh_price: number
          previous_date_reading: string
          previous_reading: number
          public_lighting: number
          user_id: string
        }
        Insert: {
          consumption: number
          created_at?: string
          current_date_reading: string
          current_reading: number
          daily_consumption: number
          estimated_cost: number
          flag_type?: string
          flag_value?: number
          id?: string
          kwh_price?: number
          previous_date_reading: string
          previous_reading: number
          public_lighting?: number
          user_id: string
        }
        Update: {
          consumption?: number
          created_at?: string
          current_date_reading?: string
          current_reading?: number
          daily_consumption?: number
          estimated_cost?: number
          flag_type?: string
          flag_value?: number
          id?: string
          kwh_price?: number
          previous_date_reading?: string
          previous_reading?: number
          public_lighting?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          consumption: number
          cost: number | null
          created_at: string
          daily_average: number
          file_name: string
          id: string
          month: string
          pdf_data: string | null
          type: string
          user_id: string
          year: number
        }
        Insert: {
          consumption: number
          cost?: number | null
          created_at?: string
          daily_average: number
          file_name: string
          id?: string
          month: string
          pdf_data?: string | null
          type: string
          user_id: string
          year: number
        }
        Update: {
          consumption?: number
          cost?: number | null
          created_at?: string
          daily_average?: number
          file_name?: string
          id?: string
          month?: string
          pdf_data?: string | null
          type?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      water_readings: {
        Row: {
          consumption: number
          created_at: string
          current_date_reading: string
          current_reading: number
          daily_consumption: number
          estimated_monthly_consumption: number
          id: string
          previous_date_reading: string
          previous_reading: number
          user_id: string
        }
        Insert: {
          consumption: number
          created_at?: string
          current_date_reading: string
          current_reading: number
          daily_consumption: number
          estimated_monthly_consumption: number
          id?: string
          previous_date_reading: string
          previous_reading: number
          user_id: string
        }
        Update: {
          consumption?: number
          created_at?: string
          current_date_reading?: string
          current_reading?: number
          daily_consumption?: number
          estimated_monthly_consumption?: number
          id?: string
          previous_date_reading?: string
          previous_reading?: number
          user_id?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
