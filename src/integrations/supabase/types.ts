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
      asaas_config: {
        Row: {
          created_at: string | null
          id: number
          production_api_key: string | null
          sandbox_api_key: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          production_api_key?: string | null
          sandbox_api_key?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          production_api_key?: string | null
          sandbox_api_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      asaas_payments: {
        Row: {
          created_at: string | null
          id: number
          method: string | null
          order_id: number | null
          payment_id: string
          qr_code: string | null
          qr_code_image: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          method?: string | null
          order_id?: number | null
          payment_id: string
          qr_code?: string | null
          qr_code_image?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          method?: string | null
          order_id?: number | null
          payment_id?: string
          qr_code?: string | null
          qr_code_image?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asaas_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          credit_card_cvv: string | null
          credit_card_expiry: string | null
          credit_card_number: string | null
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: number
          payment_method: string | null
          price: number
          product_id: number | null
          product_name: string
          qr_code: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_card_cvv?: string | null
          credit_card_expiry?: string | null
          credit_card_number?: string | null
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: number
          payment_method?: string | null
          price: number
          product_id?: number | null
          product_name: string
          qr_code?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_card_cvv?: string | null
          credit_card_expiry?: string | null
          credit_card_number?: string | null
          customer_cpf?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: number
          payment_method?: string | null
          price?: number
          product_id?: number | null
          product_name?: string
          qr_code?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pixel_settings: {
        Row: {
          created_at: string | null
          google_page_view: boolean | null
          google_pixel_enabled: boolean | null
          google_pixel_id: string | null
          google_purchase: boolean | null
          id: number
          meta_add_to_cart: boolean | null
          meta_page_view: boolean | null
          meta_pixel_enabled: boolean | null
          meta_pixel_id: string | null
          meta_purchase: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          google_page_view?: boolean | null
          google_pixel_enabled?: boolean | null
          google_pixel_id?: string | null
          google_purchase?: boolean | null
          id?: number
          meta_add_to_cart?: boolean | null
          meta_page_view?: boolean | null
          meta_pixel_enabled?: boolean | null
          meta_pixel_id?: string | null
          meta_purchase?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          google_page_view?: boolean | null
          google_pixel_enabled?: boolean | null
          google_pixel_id?: string | null
          google_purchase?: boolean | null
          id?: number
          meta_add_to_cart?: boolean | null
          meta_page_view?: boolean | null
          meta_pixel_enabled?: boolean | null
          meta_pixel_id?: string | null
          meta_purchase?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          is_digital: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_digital?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_digital?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          allow_credit_card: boolean | null
          allow_pix: boolean | null
          asaas_enabled: boolean | null
          created_at: string | null
          id: number
          manual_credit_card: boolean | null
          sandbox_mode: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_credit_card?: boolean | null
          allow_pix?: boolean | null
          asaas_enabled?: boolean | null
          created_at?: string | null
          id?: number
          manual_credit_card?: boolean | null
          sandbox_mode?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_credit_card?: boolean | null
          allow_pix?: boolean | null
          asaas_enabled?: boolean | null
          created_at?: string | null
          id?: number
          manual_credit_card?: boolean | null
          sandbox_mode?: boolean | null
          updated_at?: string | null
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
