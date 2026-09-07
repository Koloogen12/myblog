import { supabase, SUPABASE_PROXY_PATH } from '@/integrations/supabase/client';

const BUCKET = 'blog-images';

// Absolute hosts baked into old DB rows, normalised onto whatever origin the
// app is actually served from. supabase.co is blocked by some Russian ISPs;
// the two dkochnev.com forms are older proxy URLs — rewriting them keeps the
// www variant and any preview host pointing at the right place. On the apex
// host the rewrite is a no-op, which is exactly what we want.
const LEGACY_HOSTS = [
  'https://mxttoiqtviaobotoekxw.supabase.co',
  'https://dkochnev.com/supabase',
  'https://www.dkochnev.com/supabase',
];

function proxyBase(): string {
  const fromEnv = import.meta.env.VITE_SUPABASE_URL;
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined') return window.location.origin + SUPABASE_PROXY_PATH;
  return 'https://mxttoiqtviaobotoekxw.supabase.co';
}

/**
 * Rewrite any legacy direct-to-supabase.co URL onto our same-origin proxy.
 * Pass-through for anything else (already proxied, external URLs, paths).
 */
export function proxyUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const base = proxyBase();
  for (const legacy of LEGACY_HOSTS) {
    if (url.startsWith(legacy)) return base + url.slice(legacy.length);
  }
  return url;
}

/**
 * Same as proxyUrl but operates on an HTML string — rewrites every
 * occurrence of the legacy host (e.g. inline <img src="..."> in post HTML).
 */
export function rewriteLegacySupabaseUrls(html: string): string {
  if (!html) return html;
  const base = proxyBase();
  let out = html;
  for (const legacy of LEGACY_HOSTS) {
    if (out.includes(legacy)) out = out.split(legacy).join(base);
  }
  return out;
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
