import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { proxyUrl, rewriteLegacySupabaseUrls } from '@/lib/storage';
import type { Post } from '@/types';

type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at'>;
type PostUpdate = Partial<PostInsert> & { id: string };

/**
 * Rewrite any direct-to-supabase.co URLs that may be baked into a post row
 * (cover, inline HTML images). Lets every UI consumer use the proxied origin
 * without sprinkling proxyUrl() across every component.
 */
function rewritePost<T extends Partial<Post>>(post: T): T {
  if (!post) return post;
  const out = { ...post } as T;
  if (out.cover_image_url) out.cover_image_url = proxyUrl(out.cover_image_url) ?? out.cover_image_url;
  if (out.content_html) out.content_html = rewriteLegacySupabaseUrls(out.content_html);
  if (out.content) out.content = rewriteLegacySupabaseUrls(out.content);
  return out;
}

export function usePosts(filters?: { is_published?: boolean; category?: string }) {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: async () => {
      let query = supabase.from('posts').select('id, title, slug, content, content_html, excerpt, cover_image_url, category, rating, reading_time, is_published, published_at, created_at, updated_at');
      if (filters?.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      const { data, error } = await query.order('published_at', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data as Post[]).map(rewritePost);
    },
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, content, content_html, excerpt, cover_image_url, category, rating, reading_time, is_published, published_at, created_at, updated_at')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return rewritePost(data as Post);
    },
    enabled: !!slug,
    retry: 1,
  });
}

export function usePostById(id: string) {
  return useQuery({
    queryKey: ['post-by-id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return rewritePost(data as Post);
    },
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: PostInsert) => {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();
      if (error) throw error;
      return rewritePost(data as Post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: PostUpdate) => {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return rewritePost(data as Post);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['post-by-id', data.id] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
