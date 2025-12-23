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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          credits: number
          credits_extras: number
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_status: string
          subscription_plan: string | null
          subscription_current_period_start: string | null
          subscription_current_period_end: string | null
          account_status: 'active' | 'suspended'
          account_suspended_reason: string | null
          account_suspended_at: string | null
          has_used_trial: boolean
          is_admin: number
          fbc: string | null
          fbp: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          credits_extras?: number
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string
          subscription_plan?: string | null
          subscription_current_period_start?: string | null
          subscription_current_period_end?: string | null
          account_status?: 'active' | 'suspended'
          account_suspended_reason?: string | null
          account_suspended_at?: string | null
          has_used_trial?: boolean
          is_admin?: number
          fbc?: string | null
          fbp?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          credits_extras?: number
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string
          subscription_plan?: string | null
          subscription_current_period_start?: string | null
          subscription_current_period_end?: string | null
          account_status?: 'active' | 'suspended'
          account_suspended_reason?: string | null
          account_suspended_at?: string | null
          has_used_trial?: boolean
          is_admin?: number
          fbc?: string | null
          fbp?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      workflows: {
        Row: {
          id: string
          user_id: string
          name: string
          nodes: Json
          connections: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          nodes?: Json
          connections?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          nodes?: Json
          connections?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      generations: {
        Row: {
          id: string
          user_id: string
          workflow_id: string | null
          tool: string
          status: string
          result_url: string | null
          credits_used: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workflow_id?: string | null
          tool: string
          status?: string
          result_url?: string | null
          credits_used?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workflow_id?: string | null
          tool?: string
          status?: string
          result_url?: string | null
          credits_used?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          }
        ]
      }
      rate_limits: {
        Row: {
          id: string
          user_id: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      pixels: {
        Row: {
          id: string
          type: 'facebook' | 'gtm'
          pixel_id: string
          access_token: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'facebook' | 'gtm'
          pixel_id: string
          access_token?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'facebook' | 'gtm'
          pixel_id?: string
          access_token?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
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

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Workflow = Database['public']['Tables']['workflows']['Row']
export type Generation = Database['public']['Tables']['generations']['Row']
export type SiteSettings = Database['public']['Tables']['site_settings']['Row']
export type Pixel = Database['public']['Tables']['pixels']['Row']
