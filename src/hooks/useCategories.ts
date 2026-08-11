import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  group_name: 'synthesize' | 'distill';
  sort_order: number;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as CategoryRow[];
    },
  });
}

/** Returns a slug→name map for quick lookups */
export function useCategoryMap(): Record<string, string> {
  const { data: categories = [] } = useCategories();
  return useMemo(() => {
    const m: Record<string, string> = {};
    categories.forEach(c => { m[c.slug] = c.name; });
    return m;
  }, [categories]);
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: Omit<CategoryRow, 'id'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(cat)
        .select()
        .single();
      if (error) throw error;
      return data as CategoryRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CategoryRow> & { id: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as CategoryRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}
