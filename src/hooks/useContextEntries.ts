import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContextEntry {
  id: string;
  category: 'bio' | 'product' | 'trend' | 'goal' | 'event';
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type ContextEntryInsert = Omit<ContextEntry, 'id' | 'created_at' | 'updated_at'>;
type ContextEntryUpdate = Partial<ContextEntryInsert> & { id: string };

export function useContextEntries() {
  return useQuery({
    queryKey: ['context-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('context_entries')
        .select('*')
        .order('category')
        .order('created_at');
      if (error) throw error;
      return data as ContextEntry[];
    },
  });
}

export function useCreateContextEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: ContextEntryInsert) => {
      const { data, error } = await supabase.from('context_entries').insert(entry).select().single();
      if (error) throw error;
      return data as ContextEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['context-entries'] }),
  });
}

export function useUpdateContextEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: ContextEntryUpdate) => {
      const { data, error } = await supabase.from('context_entries').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as ContextEntry;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['context-entries'] }),
  });
}

export function useDeleteContextEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('context_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['context-entries'] }),
  });
}
