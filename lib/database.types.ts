export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          company: string;
          role: string;
          phone: string;
          status: "lead" | "prospect" | "customer" | "churned";
          last_contact: string;
          avatar: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          company?: string;
          role?: string;
          phone?: string;
          status?: "lead" | "prospect" | "customer" | "churned";
          last_contact?: string;
          avatar?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          company?: string;
          role?: string;
          phone?: string;
          status?: "lead" | "prospect" | "customer" | "churned";
          last_contact?: string;
          avatar?: string;
          notes?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          user_id: string | null;
          contact_id: string;
          title: string;
          amount: number;
          stage: "discovery" | "pricing" | "negotiating" | "closing";
          probability: number;
          expected_close_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          contact_id: string;
          title: string;
          amount?: number;
          stage?: "discovery" | "pricing" | "negotiating" | "closing";
          probability?: number;
          expected_close_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          contact_id?: string;
          title?: string;
          amount?: number;
          stage?: "discovery" | "pricing" | "negotiating" | "closing";
          probability?: number;
          expected_close_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          user_id: string | null;
          contact_id: string;
          deal_id: string | null;
          type: "call" | "email" | "meeting" | "note" | "task";
          title: string;
          description: string;
          completed: boolean;
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          contact_id: string;
          deal_id?: string | null;
          type?: "call" | "email" | "meeting" | "note" | "task";
          title: string;
          description?: string;
          completed?: boolean;
          due_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          contact_id?: string;
          deal_id?: string | null;
          type?: "call" | "email" | "meeting" | "note" | "task";
          title?: string;
          description?: string;
          completed?: boolean;
          due_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
