import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContentItem {
  id: string;
  title: string;
  status: 'idea' | 'writing' | 'ready' | 'queued' | 'published';
  content_type: 'post' | 'sprint' | 'carousel' | 'video' | 'link';
  platforms: string[];
  master_text: string;
  platform_versions: Record<string, string>;
  scheduled_at: string | null;
  published_at: string | null;
  slug: string | null;
  tags: string[];
  notes: string;
  ai_generated: boolean;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

type ContentItemInsert = Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>;
type ContentItemUpdate = Partial<ContentItemInsert> & { id: string };

export function useContentItems(status?: string) {
  return useQuery({
    queryKey: ['content-items', status],
    queryFn: async () => {
      let query = supabase.from('content_items').select('*');
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as ContentItem[];
    },
  });
}

export function useContentItem(id: string) {
  return useQuery({
    queryKey: ['content-item', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('content_items').select('*').eq('id', id).single();
      if (error) throw error;
      return data as ContentItem;
    },
    enabled: !!id,
  });
}

export function useCreateContentItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: ContentItemInsert) => {
      const { data, error } = await supabase.from('content_items').insert({
        ...item,
        platform_versions: JSON.parse(JSON.stringify(item.platform_versions)),
      }).select().single();
      if (error) throw error;
      return data as ContentItem;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content-items'] }),
  });
}

export function useUpdateContentItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: ContentItemUpdate) => {
      const payload: any = { ...updates };
      if (updates.platform_versions) payload.platform_versions = JSON.parse(JSON.stringify(updates.platform_versions));
      const { data, error } = await supabase.from('content_items').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data as ContentItem;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['content-items'] });
      qc.invalidateQueries({ queryKey: ['content-item', data.id] });
    },
  });
}

export function useDeleteContentItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content-items'] }),
  });
}
