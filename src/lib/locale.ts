import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n';

const EN_PREFIX = '/en';

/**
 * Read the active locale from a pathname.
 *   /en           → 'en'
 *   /en/blog/...  → 'en'
 *   /blog/...     → 'ru'
 *   /             → 'ru'
 */
export function localeFromPath(pathname: string): Locale {
  if (pathname === EN_PREFIX || pathname.startsWith(EN_PREFIX + '/')) {
    return 'en';
  }
  return DEFAULT_LOCALE;
}

/**
 * Strip the `/en` prefix from a path to get the underlying "canonical" route.
 *   /en/blog → /blog
 *   /en      → /
 *   /blog    → /blog
 */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === EN_PREFIX) return '/';
  if (pathname.startsWith(EN_PREFIX + '/')) return pathname.slice(EN_PREFIX.length);
  return pathname;
}

/**
 * Build a localized URL.
 *   localizedPath('/blog', 'en') → '/en/blog'
 *   localizedPath('/blog', 'ru') → '/blog'
 *   localizedPath('/', 'en')     → '/en'
 */
export function localizedPath(path: string, locale: Locale): string {
  // Always work from the canonical (un-prefixed) form.
  const canonical = stripLocalePrefix(path);
  if (locale === 'ru') return canonical;
  if (canonical === '/') return EN_PREFIX;
  return EN_PREFIX + canonical;
}

/**
 * Switch the current path between locales without losing the page.
 *   /blog/foo + 'en' → /en/blog/foo
 *   /en/about + 'ru' → /about
 */
export function switchLocale(currentPath: string, target: Locale): string {
  return localizedPath(currentPath, target);
}

export { LOCALES, DEFAULT_LOCALE };
export type { Locale };
