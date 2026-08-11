import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/seo/SEOHead';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath, stripLocalePrefix } from '@/lib/locale';

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const locale = useLocale();

  useEffect(() => {
    console.error('404: non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEOHead
        title={t('common.notFoundTitle')}
        path={stripLocalePrefix(location.pathname)}
        noIndex
      />
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <p className="text-7xl font-bold font-display text-primary mb-4">404</p>
          <h1 className="text-2xl font-bold font-display mb-2">{t('common.notFoundTitle')}</h1>
          <p className="text-muted-foreground mb-8">{t('common.notFoundBody')}</p>
          <Link
            to={localizedPath('/', locale)}
            className="inline-block text-sm px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {t('common.backHome')}
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
