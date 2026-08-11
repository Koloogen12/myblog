/**
 * Minimal, dependency-free <head> manager.
 *
 * Replaces react-helmet-async, which silently stopped applying tags on this
 * app (no error, no tags — every route served index.html's default title,
 * which meant zero titles/descriptions/canonicals/JSON-LD for crawlers).
 * Rather than debug a third party's version detection, we own these ~70 lines:
 * every tag we write is marked with data-seo so we can replace the whole set
 * on each render without touching the static tags shipped in index.html.
 */

const OWNED = 'data-seo';

export interface MetaTag {
  name?: string;
  property?: string;
  httpEquiv?: string;
  content: string;
}

export interface LinkTag {
  rel: string;
  href: string;
  hrefLang?: string;
  type?: string;
  title?: string;
}

export interface HeadConfig {
  title?: string;
  lang?: string;
  meta?: MetaTag[];
  links?: LinkTag[];
  /** Each entry is rendered as its own <script type="application/ld+json">. */
  jsonLd?: Array<Record<string, unknown>>;
}

/** Remove every tag this module previously wrote. */
function clearOwned() {
  document.head.querySelectorAll(`[${OWNED}]`).forEach(el => el.remove());
}

/**
 * Apply a head configuration. Call from an effect; safe to call repeatedly.
 * Static tags in index.html without the data-seo marker are left untouched,
 * except <title>, which is a single element by definition.
 */
export function applyHead(config: HeadConfig): void {
  if (typeof document === 'undefined') return;

  clearOwned();

  if (config.title) document.title = config.title;
  if (config.lang) document.documentElement.lang = config.lang;

  for (const m of config.meta ?? []) {
    if (!m.content) continue;
    const el = document.createElement('meta');
    if (m.name) el.setAttribute('name', m.name);
    if (m.property) el.setAttribute('property', m.property);
    if (m.httpEquiv) el.setAttribute('http-equiv', m.httpEquiv);
    el.setAttribute('content', m.content);
    el.setAttribute(OWNED, '');
    document.head.appendChild(el);
  }

  for (const l of config.links ?? []) {
    if (!l.href) continue;
    const el = document.createElement('link');
    el.setAttribute('rel', l.rel);
    el.setAttribute('href', l.href);
    if (l.hrefLang) el.setAttribute('hreflang', l.hrefLang);
    if (l.type) el.setAttribute('type', l.type);
    if (l.title) el.setAttribute('title', l.title);
    el.setAttribute(OWNED, '');
    document.head.appendChild(el);
  }

  for (const block of config.jsonLd ?? []) {
    const el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute(OWNED, '');
    el.textContent = JSON.stringify(block);
    document.head.appendChild(el);
  }
}
