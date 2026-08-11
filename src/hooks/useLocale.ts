import { useLocation } from 'react-router-dom';
import { localeFromPath, type Locale } from '@/lib/locale';

/**
 * Active locale, derived from URL. URL is the single source of truth — no
 * separate state, no detection from `navigator.language`. That makes every
 * route shareable and SEO-correct.
 */
export function useLocale(): Locale {
  const { pathname } = useLocation();
  return localeFromPath(pathname);
}
