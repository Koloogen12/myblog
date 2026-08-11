import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SprintBullet { id: string; text: string; }
export interface SprintSection { id: string; title: string; content: string; }

export interface Sprint {
  id: string;
  project_id: string;
  week_start: string;
  week_end: string;
  status: 'draft' | 'published' | 'not_filled';
  metrics: Record<string, number>;
  intro: string;
  show_intro: boolean;
  bullets: SprintBullet[];
  sections: SprintSection[];
  created_at: string;
  updated_at: string;
}

type SprintInsert = Omit<Sprint, 'id' | 'created_at' | 'updated_at'>;
type SprintUpdate = Partial<SprintInsert> & { id: string };

export function useSprints(projectId?: string) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      let query = supabase.from('sprints').select('*');
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query.order('week_start', { ascending: false });
      if (error) throw error;
      return data as Sprint[];
    },
  });
}

export function useSprint(id: string) {
  return useQuery({
    queryKey: ['sprint', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('sprints').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Sprint;
    },
    enabled: !!id,
  });
}

export function useCreateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sprint: SprintInsert) => {
      const { data, error } = await supabase.from('sprints').insert({
        ...sprint,
        metrics: JSON.parse(JSON.stringify(sprint.metrics)),
        bullets: JSON.parse(JSON.stringify(sprint.bullets)),
        sections: JSON.parse(JSON.stringify(sprint.sections)),
      }).select().single();
      if (error) throw error;
      return data as Sprint;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sprints'] }),
  });
}

export function useUpdateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: SprintUpdate) => {
      const payload: any = { ...updates };
      if (updates.metrics) payload.metrics = JSON.parse(JSON.stringify(updates.metrics));
      if (updates.bullets) payload.bullets = JSON.parse(JSON.stringify(updates.bullets));
      if (updates.sections) payload.sections = JSON.parse(JSON.stringify(updates.sections));
      const { data, error } = await supabase.from('sprints').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data as Sprint;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['sprints'] });
      qc.invalidateQueries({ queryKey: ['sprint', data.id] });
    },
  });
}
