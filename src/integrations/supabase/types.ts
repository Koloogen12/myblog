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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      content_items: {
        Row: {
          ai_generated: boolean | null
          content_type: string
          created_at: string | null
          id: string
          master_text: string | null
          notes: string | null
          platform_versions: Json | null
          platforms: string[] | null
          project_id: string | null
          published_at: string | null
          scheduled_at: string | null
          slug: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          content_type?: string
          created_at?: string | null
          id?: string
          master_text?: string | null
          notes?: string | null
          platform_versions?: Json | null
          platforms?: string[] | null
          project_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          content_type?: string
          created_at?: string | null
          id?: string
          master_text?: string | null
          notes?: string | null
          platform_versions?: Json | null
          platforms?: string[] | null
          project_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_plan: {
        Row: {
          content_type: string
          created_at: string | null
          id: string
          notes: string | null
          planned_date: string
          platforms: string[] | null
          post_slug: string | null
          status: string
          title: string
        }
        Insert: {
          content_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          planned_date: string
          platforms?: string[] | null
          post_slug?: string | null
          status?: string
          title: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          planned_date?: string
          platforms?: string[] | null
          post_slug?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      context_entries: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          category: string
          content: string
          content_html: string | null
          content_json: Json | null
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          rating: number | null
          reading_time: number
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content?: string
          content_html?: string | null
          content_json?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          rating?: number | null
          reading_time?: number
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          content_html?: string | null
          content_json?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          rating?: number | null
          reading_time?: number
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string
          id: string
          metrics: Json | null
          name: string
          slug: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          metrics?: Json | null
          name: string
          slug: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          metrics?: Json | null
          name?: string
          slug?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sprints: {
        Row: {
          bullets: Json | null
          created_at: string | null
          id: string
          intro: string | null
          metrics: Json | null
          project_id: string | null
          sections: Json | null
          show_intro: boolean | null
          status: string
          updated_at: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          bullets?: Json | null
          created_at?: string | null
          id?: string
          intro?: string | null
          metrics?: Json | null
          project_id?: string | null
          sections?: Json | null
          show_intro?: boolean | null
          status?: string
          updated_at?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          bullets?: Json | null
          created_at?: string | null
          id?: string
          intro?: string | null
          metrics?: Json | null
          project_id?: string | null
          sections?: Json | null
          show_intro?: boolean | null
          status?: string
          updated_at?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
A new version of Supabase CLI is available: v2.84.2 (currently installed v2.75.0)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
