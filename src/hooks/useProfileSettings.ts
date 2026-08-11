import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { proxyUrl } from '@/lib/storage';

export interface ProfileSettings {
  name: string;
  tagline: string;
  bio: string;
  signature: string;
  avatarUrl: string;
  links: { title: string; url: string }[];
  socials: Record<string, string>;
}

const DEFAULT_PROFILE: ProfileSettings = {
  name: 'Данил Кочнев',
  tagline: 'Serial Founder. Строю продукты публично.',
  bio: '',
  signature: '',
  avatarUrl: '',
  links: [],
  socials: {},
};

export function useProfileSettings() {
  return useQuery({
    queryKey: ['site-settings', 'profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'profile')
        .single();
      if (error) return DEFAULT_PROFILE;
      const merged = { ...DEFAULT_PROFILE, ...(data.value as object) } as ProfileSettings;
      // Rewrite legacy direct-to-supabase.co avatar URLs to our same-origin proxy.
      if (merged.avatarUrl) merged.avatarUrl = proxyUrl(merged.avatarUrl) ?? merged.avatarUrl;
      return merged;
    },
    // Keep avatar/profile cached across page navigations so we don't flash
    // the bundled placeholder every time the user clicks between pages.
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfileSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: ProfileSettings) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'profile',
          value: settings as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site-settings', 'profile'] }),
  });
}
