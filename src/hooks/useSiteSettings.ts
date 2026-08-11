import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SEOSettings {
  siteName: string;
  titleTemplate: string;
  description: string;
  ogTitle: string;
  ogImageUrl: string;
  gaId: string;
}

const DEFAULT_SEO: SEOSettings = {
  siteName: 'Данил Кочнев',
  titleTemplate: '{заголовок} — Данил Кочнев',
  description: '',
  ogTitle: 'Данил Кочнев',
  ogImageUrl: '',
  gaId: '',
};

export function useSEOSettings() {
  return useQuery({
    queryKey: ['site-settings', 'seo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'seo')
        .single();
      if (error) return DEFAULT_SEO;
      return { ...DEFAULT_SEO, ...(data.value as object) } as SEOSettings;
    },
  });
}

export function useUpdateSEOSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SEOSettings) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'seo', value: settings as unknown as Record<string, unknown>, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site-settings', 'seo'] }),
  });
}
