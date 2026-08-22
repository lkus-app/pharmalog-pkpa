export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = "student" | "admin"

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          name: string
          nim: string
          pharmacy: string
          preceptor: string
          period: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          nim: string
          pharmacy?: string
          preceptor?: string
          period?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          nim?: string
          pharmacy?: string
          preceptor?: string
          period?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      drug_progress: {
        Row: {
          id: string
          student_id: string
          therapy_id: string
          drug_id: string
          mechanism: string
          indications: string
          dosage: string
          administration: string
          side_effects: string
          counseling: string
          brands: string
          completed: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          therapy_id: string
          drug_id: string
          mechanism?: string
          indications?: string
          dosage?: string
          administration?: string
          side_effects?: string
          counseling?: string
          brands?: string
          completed?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          therapy_id?: string
          drug_id?: string
          mechanism?: string
          indications?: string
          dosage?: string
          administration?: string
          side_effects?: string
          counseling?: string
          brands?: string
          completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          student_id: string
          drug_id: string
          created_at: string
        }
        Insert: {
          student_id: string
          drug_id: string
          created_at?: string
        }
        Update: {
          student_id?: string
          drug_id?: string
          created_at?: string
        }
        Relationships: []
      }
      recent_drugs: {
        Row: {
          student_id: string
          drug_id: string
          viewed_at: string
        }
        Insert: {
          student_id: string
          drug_id: string
          viewed_at?: string
        }
        Update: {
          student_id?: string
          drug_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
    }
    CompositeTypes: Record<string, never>
  }
}

export type StudentRow = Database["public"]["Tables"]["students"]["Row"]
export type DrugProgressRow = Database["public"]["Tables"]["drug_progress"]["Row"]
export type FavoriteRow = Database["public"]["Tables"]["favorites"]["Row"]
export type RecentDrugRow = Database["public"]["Tables"]["recent_drugs"]["Row"]
