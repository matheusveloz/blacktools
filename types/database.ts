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
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_status: string
          subscription_plan: string | null
          subscription_current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string
          subscription_plan?: string | null
          subscription_current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string
          subscription_plan?: string | null
          subscription_current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
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
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Workflow = Database['public']['Tables']['workflows']['Row']
export type Generation = Database['public']['Tables']['generations']['Row']
