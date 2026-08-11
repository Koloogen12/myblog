import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContentPlanItem {
  id: string;
  planned_date: string;
  title: string;
  content_type: string;
  platforms: string[];
  status: 'planned' | 'in_progress' | 'done' | 'skipped';
  post_slug: string | null;
  notes: string;
  created_at: string;
}

type ContentPlanInsert = Omit<ContentPlanItem, 'id' | 'created_at'>;
type ContentPlanUpdate = Partial<ContentPlanInsert> & { id: string };

export function useContentPlan() {
  return useQuery({
    queryKey: ['content-plan'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_plan')
        .select('*')
        .order('planned_date', { ascending: true });
      if (error) throw error;
      return data as ContentPlanItem[];
    },
  });
}

export function useCreatePlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: ContentPlanInsert) => {
      const { data, error } = await supabase.from('content_plan').insert(item).select().single();
      if (error) throw error;
      return data as ContentPlanItem;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content-plan'] }),
  });
}

export function useUpdatePlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: ContentPlanUpdate) => {
      const { data, error } = await supabase.from('content_plan').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as ContentPlanItem;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content-plan'] }),
  });
}
