export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: number
          description: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          description: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          description?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      provinces: {
        Row: {
          id: number
          description: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          description: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          description?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      days: {
        Row: {
          id: number
          description: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          description: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          description?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      peoples: {
        Row: {
          id: number
          name: string
          dni_identification: string
          is_foreign: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          dni_identification: string
          is_foreign?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          dni_identification?: string
          is_foreign?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      companies: {
        Row: {
          id: number
          name: string
          short_description: string | null
          long_description: string | null
          with_reservation: boolean
          with_delivery: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          short_description?: string | null
          long_description?: string | null
          with_reservation?: boolean
          with_delivery?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          short_description?: string | null
          long_description?: string | null
          with_reservation?: boolean
          with_delivery?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      locations: {
        Row: {
          id: number
          description: string
          price: number
          province_id: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          description: string
          price: number
          province_id: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          description?: string
          price?: number
          province_id?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      locations_companies: {
        Row: {
          id: number
          location_id: number
          company_id: number
          lat: number
          long: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          location_id: number
          company_id: number
          lat: number
          long: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          location_id?: number
          company_id?: number
          lat?: number
          long?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      memberships: {
        Row: {
          id: number
          location_id: number
          people_id: number
          total: number
          total_keys: number
          remaining_keys: number
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          location_id: number
          people_id: number
          total: number
          total_keys: number
          remaining_keys: number
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          location_id?: number
          people_id?: number
          total?: number
          total_keys?: number
          remaining_keys?: number
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      keys_used_companies: {
        Row: {
          id: number
          company_id: number
          membership_id: number
          is_used: boolean
          date_of_use: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          company_id: number
          membership_id: number
          is_used?: boolean
          date_of_use?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          company_id?: number
          membership_id?: number
          is_used?: boolean
          date_of_use?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      services: {
        Row: {
          id: number
          description: string
          company_id: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          description: string
          company_id: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          description?: string
          company_id?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      promotions: {
        Row: {
          id: number
          description: string
          service_id: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          description: string
          service_id: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          description?: string
          service_id?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      schedules: {
        Row: {
          id: number
          company_id: number
          days_id: number
          start_time: string
          end_time: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          company_id: number
          days_id: number
          start_time: string
          end_time: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          company_id?: number
          days_id?: number
          start_time?: string
          end_time?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      companies_images: {
        Row: {
          id: number
          file_url: string
          company_id: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          file_url: string
          company_id: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          file_url?: string
          company_id?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          city: string | null
          phone: string | null
          profile_picture_url: string | null
          accumulated_savings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          city?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          accumulated_savings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          city?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          accumulated_savings?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_memberships: {
        Row: {
          id: string
          user_id: string
          province_id: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          province_id: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          province_id?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}