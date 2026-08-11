import { useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath, stripLocalePrefix } from '@/lib/locale';
import { applyHead, type MetaTag, type LinkTag } from '@/lib/seo/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  /** Canonical path without locale prefix, e.g. "/about". */
  path?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  noIndex?: boolean;
  /** ISO date — renders article:published_time and feeds "freshness" signals. */
  publishedTime?: string;
  /** ISO date — article:modified_time. AI answer engines weight recency. */
  modifiedTime?: string;
}

const SITE_NAME_BY_LOCALE = {
  ru: 'Данил Кочнев',
  en: 'Danil Kochnev',
} as const;

const DEFAULT_DESCRIPTION = {
  ru: 'Серийный IT-предприниматель. Развиваю THE MONO (B2B-маркетплейс), MakeMeLook (AI-примерка), NEURIN AI и другие продукты. Помогаю фаундерам строить и масштабировать стартапы.',
  en: 'Serial IT founder. Building THE MONO (B2B wholesale marketplace), MakeMeLook (AI try-on), NEURIN AI and more. Notes on shipping products and scaling startups.',
} as const;

const DEFAULT_KEYWORDS = {
  ru: 'Данил Кочнев, серийный предприниматель, IT-предприниматель, фаундер, THE MONO, MakeMeLook, NEURIN AI, AI продукты, B2B маркетплейс, виртуальная примерка, блог фаундера, продуктовый трекинг, как построить стартап',
  en: 'Danil Kochnev, serial founder, IT entrepreneur, startup, THE MONO, MakeMeLook, NEURIN AI, B2B marketplace, virtual try-on, founder notes, product thinking, how to build a startup',
} as const;

const BASE_URL = 'https://dkochnev.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
const OG_LOCALE_TAG = { ru: 'ru_RU', en: 'en_US' } as const;
const DEFAULT_TITLE_TAIL = {
  ru: 'серийный IT-предприниматель',
  en: 'serial IT founder',
} as const;

const SEOHead = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  path = '',
  jsonLd,
  noIndex = false,
  publishedTime,
  modifiedTime,
}: SEOHeadProps) => {
  const locale = useLocale();
  const siteName = SITE_NAME_BY_LOCALE[locale];

  // `path` is always locale-agnostic (canonical). We build the locale-aware
  // URL for this request plus the alternate-locale URL for hreflang.
  const canonicalPath = stripLocalePrefix(path) || '/';
  const localePath = localizedPath(canonicalPath, locale);
  const otherLocale = locale === 'en' ? 'ru' : 'en';

  const pageTitle = !title
    ? `${siteName} — ${DEFAULT_TITLE_TAIL[locale]}`
    : title.includes(siteName)
      ? title
      : `${title} — ${siteName}`;
  const pageDescription = description || DEFAULT_DESCRIPTION[locale];
  const pageKeywords = keywords || DEFAULT_KEYWORDS[locale];
  const canonicalUrl = `${BASE_URL}${localePath}`;
  const alternateUrl = `${BASE_URL}${localizedPath(canonicalPath, otherLocale)}`;
  const xDefaultUrl = `${BASE_URL}${localizedPath(canonicalPath, 'ru')}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  const jsonLdArray = !jsonLd ? [] : Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  // Serialise so the effect re-runs on actual content change, not identity.
  const jsonLdKey = JSON.stringify(jsonLdArray);

  useEffect(() => {
    const meta: MetaTag[] = [
      { name: 'description', content: pageDescription },
      { name: 'keywords', content: pageKeywords },
      { name: 'author', content: siteName },
      {
        name: 'robots',
        content: noIndex
          ? 'noindex,nofollow'
          : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      },
      { httpEquiv: 'content-language', content: locale },

      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: pageDescription },
      { property: 'og:type', content: ogType },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: OG_LOCALE_TAG[locale] },
      { property: 'og:locale:alternate', content: OG_LOCALE_TAG[otherLocale] },
      { property: 'og:image', content: image },
      { property: 'og:image:alt', content: pageTitle },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: pageDescription },
      { name: 'twitter:image', content: image },
    ];

    if (publishedTime) {
      meta.push({ property: 'article:published_time', content: publishedTime });
    }
    if (modifiedTime) {
      meta.push({ property: 'article:modified_time', content: modifiedTime });
    }

    const links: LinkTag[] = [
      { rel: 'canonical', href: canonicalUrl },
      { rel: 'alternate', hrefLang: locale, href: canonicalUrl },
      { rel: 'alternate', hrefLang: otherLocale, href: alternateUrl },
      { rel: 'alternate', hrefLang: 'x-default', href: xDefaultUrl },
    ];

    applyHead({
      title: pageTitle,
      lang: locale,
      meta,
      links,
      jsonLd: JSON.parse(jsonLdKey) as Array<Record<string, unknown>>,
    });
  }, [
    pageTitle,
    pageDescription,
    pageKeywords,
    siteName,
    locale,
    otherLocale,
    ogType,
    canonicalUrl,
    alternateUrl,
    xDefaultUrl,
    image,
    noIndex,
    publishedTime,
    modifiedTime,
    jsonLdKey,
  ]);

  return null;
};

export default SEOHead;
