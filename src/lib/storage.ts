import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'blog-images';

// Legacy direct-to-supabase.co host. Any URL stored in the DB before we put
// the nginx reverse proxy in front of Supabase will point at this host.
// Russian ISPs block it, so we rewrite to same-origin on render.
const LEGACY_SUPABASE_HOST = 'https://mxttoiqtviaobotoekxw.supabase.co';
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://dkochnev.com/supabase';

/**
 * Rewrite any legacy direct-to-supabase.co URL onto our same-origin proxy.
 * Pass-through for anything else (already proxied, external URLs, paths).
 */
export function proxyUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith(LEGACY_SUPABASE_HOST)) {
    return SUPABASE_URL + url.slice(LEGACY_SUPABASE_HOST.length);
  }
  return url;
}

/**
 * Same as proxyUrl but operates on an HTML string — rewrites every
 * occurrence of the legacy host (e.g. inline <img src="..."> in post HTML).
 */
export function rewriteLegacySupabaseUrls(html: string): string {
  if (!html) return html;
  if (!html.includes(LEGACY_SUPABASE_HOST)) return html;
  return html.split(LEGACY_SUPABASE_HOST).join(SUPABASE_URL);
}

/**
 * Upload an image file to Supabase Storage.
 * Works for both cover images and inline editor images.
 */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  // supabase-js builds the URL from SUPABASE_URL, so new uploads already use
  // our proxy host. We pass through proxyUrl() for symmetry.
  return proxyUrl(urlData.publicUrl) ?? urlData.publicUrl;
}

/** Backward-compatible alias */
export const uploadCoverImage = uploadImage;

export function getCoverUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return proxyUrl(path);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return proxyUrl(data.publicUrl);
}
