export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string
          name: string
          email: string
          company: string
          role: string
          phone: string
          status: "lead" | "prospect" | "customer" | "churned"
          last_contact: string
          avatar: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          company?: string
          role?: string
          phone?: string
          status?: "lead" | "prospect" | "customer" | "churned"
          last_contact?: string
          avatar?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          company?: string
          role?: string
          phone?: string
          status?: "lead" | "prospect" | "customer" | "churned"
          last_contact?: string
          avatar?: string
          created_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          contact_id: string
          title: string
          amount: number
          stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
          probability: number
          expected_close_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          title: string
          amount?: number
          stage?: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
          probability?: number
          expected_close_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          title?: string
          amount?: number
          stage?: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
          probability?: number
          expected_close_date?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          contact_id: string
          deal_id: string | null
          type: "call" | "email" | "meeting" | "note" | "task"
          title: string
          description: string
          completed: boolean
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          deal_id?: string | null
          type?: "call" | "email" | "meeting" | "note" | "task"
          title: string
          description?: string
          completed?: boolean
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          deal_id?: string | null
          type?: "call" | "email" | "meeting" | "note" | "task"
          title?: string
          description?: string
          completed?: boolean
          due_date?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
