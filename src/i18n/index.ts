import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from './ru.json';
import en from './en.json';

export type Locale = 'ru' | 'en';
export const LOCALES: Locale[] = ['ru', 'en'];
export const DEFAULT_LOCALE: Locale = 'ru';

const EN_PREFIX = '/en';

/**
 * Pick the starting language from the current URL so the very first React
 * render already shows the correct locale (no FOUC of Russian → English).
 * Kept local to avoid a circular import with src/lib/locale.ts.
 */
function pickInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const p = window.location.pathname;
  if (p === EN_PREFIX || p.startsWith(EN_PREFIX + '/')) return 'en';
  return DEFAULT_LOCALE;
}

/**
 * i18next bootstrap. Used once from src/main.tsx.
 * Language is controlled imperatively from <LocaleSync /> based on URL — we
 * deliberately don't use the i18next browser-detector so the URL is the
 * single source of truth.
 */
i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: pickInitialLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
