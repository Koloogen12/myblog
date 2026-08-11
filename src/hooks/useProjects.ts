import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  icon: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'pause' | 'archive';
  metrics: { id: string; label: string; enabled: boolean; custom?: boolean }[];
  created_at: string;
  updated_at: string;
}

type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
type ProjectUpdate = Partial<ProjectInsert> & { id: string };

export function useProjects(status?: string) {
  return useQuery({
    queryKey: ['projects', status],
    queryFn: async () => {
      let query = supabase.from('projects').select('*');
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;
      return data as Project[];
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: ProjectInsert) => {
      const { data, error } = await supabase.from('projects').insert({
        ...project,
        metrics: JSON.parse(JSON.stringify(project.metrics)),
      }).select().single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: ProjectUpdate) => {
      const payload: any = { ...updates };
      if (updates.metrics) payload.metrics = JSON.parse(JSON.stringify(updates.metrics));
      const { data, error } = await supabase.from('projects').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}
