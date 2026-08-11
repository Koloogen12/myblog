import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';

/**
 * Keeps i18next + <html lang> in sync with the URL-derived locale.
 * Render once inside the router (above app content).
 */
const LocaleSync = () => {
  const locale = useLocale();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== locale) i18n.changeLanguage(locale);
    if (typeof document !== 'undefined' && document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
  }, [locale, i18n]);

  return null;
};

export default LocaleSync;
