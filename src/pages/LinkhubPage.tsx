import { Link } from 'react-router-dom';
import {
  Instagram,
  Youtube,
  Send,
  Linkedin,
  Twitter,
  Newspaper,
  Github,
  Mail,
  Globe,
  Link as LinkIcon,
  ArrowUpRight,
} from 'lucide-react';
import SEOHead from '@/components/seo/SEOHead';
import {
  useLinkhubContent,
  DEFAULT_LINKHUB,
  type LinkhubTile,
  type LinkhubSocial,
  type SocialPlatform,
} from '@/hooks/useSiteContent';
import { proxyUrl } from '@/lib/storage';

const SOCIAL_ICON: Record<SocialPlatform, typeof Instagram> = {
  instagram: Instagram,
  youtube: Youtube,
  telegram: Send,
  telegram_channel: Send,
  linkedin: Linkedin,
  twitter: Twitter,
  vc: Newspaper,
  github: Github,
  email: Mail,
  website: Globe,
  custom: LinkIcon,
};

const isExternal = (url: string) =>
  /^(https?:)?\/\//i.test(url) || url.startsWith('mailto:');

const socialHref = (s: LinkhubSocial) => {
  if (s.platform === 'email' && !s.url.startsWith('mailto:')) return `mailto:${s.url}`;
  return s.url;
};

// Pill-shape social button — Inter 16px, dark bg
// Desktop: fixed 132px wide (like Figma). Mobile: shrink to fit label.
const SocialPill = ({ s }: { s: LinkhubSocial }) => {
  const Icon = SOCIAL_ICON[s.platform] || LinkIcon;
  const label = s.customLabel || '@kochnefff';
  const href = socialHref(s);
  const external = isExternal(href);
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="inline-flex items-center justify-start gap-2 h-8 px-3 bg-[#1c1c1c] rounded-[28px] text-white text-[14px] sm:text-[16px] leading-6 tracking-[0.01em] hover:bg-[#2a2a2a] transition-colors w-[132px]"
    >
      <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
      <span className="truncate">{label}</span>
    </a>
  );
};

// Card — dark grey with rounded corners, icon + text + button
// Desktop (≥sm): 64px icon, 144px-wide button with text
// Mobile (<sm):  48px icon, 40×40 square button with arrow
const Card = ({ tile }: { tile: LinkhubTile }) => {
  const external = isExternal(tile.url);
  const Wrapper: React.ElementType = external ? 'a' : Link;
  const wrapperProps = external
    ? { href: tile.url, target: '_blank', rel: 'noopener noreferrer' }
    : { to: tile.url || '#' };

  return (
    <Wrapper
      {...wrapperProps}
      className="block w-full rounded-[6px] bg-[#1c1c1c] border border-[#141414] hover:bg-[#202020] transition-colors overflow-hidden group"
    >
      <div className="flex items-stretch gap-[20px] sm:gap-4 p-4 sm:pr-8">
        {/* Icon/image — stretches to card height */}
        <div
          className="w-12 sm:w-16 rounded-[6px] overflow-hidden shrink-0 self-stretch min-h-[66px] flex items-center justify-center"
          style={{ background: tile.iconBg || 'rgba(0,0,0,0.4)' }}
        >
          {tile.iconImage ? (
            <img
              src={proxyUrl(tile.iconImage)}
              alt=""
              className={`w-full h-full ${
                tile.iconFit === 'contain' ? 'object-contain p-2' : 'object-cover'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {tile.emoji || '✨'}
            </div>
          )}
        </div>

        {/* Text — grows with content, no clamp */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-[15px] leading-[18px] sm:leading-[22.5px] font-semibold text-[#f2f2f2] tracking-[-0.4px]">
            {tile.title}
          </h3>
          {tile.description && (
            <p className="text-[14px] leading-[18px] sm:leading-[21px] text-[#7c7f82] mt-2 sm:mt-1">
              {tile.description}
            </p>
          )}
        </div>

        {/* Button — text on desktop, arrow-square on mobile */}
        {tile.buttonText && (
          <div className="shrink-0 self-center">
            {/* Mobile: 40×40 square with arrow */}
            <span className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-[6px] bg-[rgba(28,28,28,0.76)] border border-[#292929] text-white group-hover:bg-[#292929] transition-colors">
              <ArrowUpRight className="w-5 h-5" strokeWidth={1.8} />
            </span>
            {/* Desktop: wide button with text */}
            <span className="hidden sm:inline-flex items-center justify-center min-w-[80px] px-6 py-3 rounded-[6px] bg-[rgba(28,28,28,0.76)] border border-[#292929] text-white text-[14px] leading-4 font-semibold group-hover:bg-[#292929] transition-colors whitespace-nowrap">
              {tile.buttonText}
            </span>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

// Infinity ∞ logo — SVG replica
const InfinityLogo = () => (
  <svg
    width="43"
    height="23"
    viewBox="0 0 43 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="logo"
  >
    <path
      d="M13.5 2C7.70101 2 3 6.70101 3 12.5C3 18.299 7.70101 23 13.5 23C17.0001 23 19.7 21 21.5 18.5C23.3 15 26.5 12 29.5 12C33.0899 12 36 8.41015 36 5C36 1.58985 33.0899 -1 29.5 -1C26 -1 23.3 1 21.5 4C19.7 7.5 17 11 13.5 11"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="translate(1,0)"
    />
  </svg>
);

/**
 * Placeholder shown while site_settings is in flight.
 *
 * Without it the page would render DEFAULT_LINKHUB for a split second — the
 * hardcoded fallback copy — and then swap to the real values from Supabase.
 * That reads as two different versions of the site flashing on load, so we
 * show neutral blocks of the same geometry instead. Same approach as the
 * hero skeletons on Index and AboutPage.
 */
const LinkhubSkeleton = () => (
  <div className="animate-pulse">
    <section className="text-center mb-[30px] sm:mb-[40px]">
      <div className="flex justify-center mb-3 sm:mb-4">
        <div className="w-[42px] h-[26px] rounded bg-white/10" />
      </div>
      <div className="h-[36px] sm:h-[51px] w-4/5 mx-auto rounded bg-white/10" />
      <div className="h-[36px] sm:h-[51px] w-3/5 mx-auto rounded bg-white/10 mt-2" />
      <div className="mt-5 sm:mt-6 max-w-[310px] sm:max-w-[529px] mx-auto space-y-2">
        <div className="h-[14px] rounded bg-white/[0.07]" />
        <div className="h-[14px] rounded bg-white/[0.07]" />
        <div className="h-[14px] w-4/5 rounded bg-white/[0.07]" />
      </div>
      <div className="flex flex-wrap sm:flex-nowrap justify-center gap-x-2 sm:gap-x-[10px] gap-y-2.5 mt-6 sm:mt-7 max-w-[296px] sm:max-w-none mx-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[38px] w-[140px] rounded-full bg-white/10" />
        ))}
      </div>
    </section>
    <div className="flex flex-col gap-[15px]">
      <div className="h-6 w-40 rounded bg-white/10 mt-4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-[104px] rounded-[10px] bg-white/[0.06]" />
      ))}
    </div>
  </div>
);

const LinkhubPage = () => {
  const { data: hubData, isLoading } = useLinkhubContent();
  // Never fall back to DEFAULT_LINKHUB while loading — see LinkhubSkeleton.
  const hub = hubData ?? DEFAULT_LINKHUB;
  const visibleSections = (hub.sections || []).filter(
    s => s.visible && s.tiles.some(t => t.visible),
  );
  const visibleSocials = (hub.socials || []).filter(s => s.visible && s.url);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap&subset=latin,cyrillic');
        .linkhub-root, .linkhub-root * {
          font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
        }
      `}</style>

      <SEOHead
        title="Данил Кочнев — серийный IT-предприниматель"
        description="Данил Кочнев — фаундер THE MONO (B2B-маркетплейс), MakeMeLook (AI-примерка одежды), THE ADSY и BUYBACK. Помогаю предпринимателям строить и масштабировать продукты. Консультации, трекинг, блог о стартапах и AI."
        keywords="Данил Кочнев, серийный предприниматель, IT-предприниматель, фаундер, THE MONO, B2B маркетплейс, MakeMeLook, MML, виртуальная примерка, THE ADSY, BUYBACK, NEURIN AI, консультации по стартапам, трекинг продуктов, AI, предпринимательство, startup, как создать продукт"
        path="/"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Данил Кочнев',
            alternateName: 'Danil Kochnev',
            url: 'https://dkochnev.com',
            jobTitle: 'Серийный IT-предприниматель',
            description:
              'Серийный IT-предприниматель. Фаундер THE MONO, MakeMeLook, NEURIN AI, THE ADSY и BUYBACK. Помогаю фаундерам и продактам строить продукты.',
            sameAs: [
              'https://t.me/kochnev_blog',
              'https://instagram.com/kochnefff',
              'https://linkedin.com/in/kochnefff',
              'https://youtube.com/@kochnefff',
              'https://vc.ru/u/618305-danil-kochnev',
            ],
            worksFor: [
              { '@type': 'Organization', name: 'THE MONO', url: 'https://themono.ru' },
              { '@type': 'Organization', name: 'MakeMeLook (MML)', url: 'https://b2b.makemelook.ai' },
              { '@type': 'Organization', name: 'THE ADSY', url: 'https://theadsy.ru' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'dkochnev.com',
            url: 'https://dkochnev.com',
            inLanguage: 'ru-RU',
            author: { '@type': 'Person', name: 'Данил Кочнев' },
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://dkochnev.com/blog?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
        ]}
      />

      <div className="linkhub-root min-h-screen relative bg-black text-white">
        {/* Decorative gradient backdrop — always rendered as a safe fallback
            so the page is never plain-black if hero image is missing or
            decodes to 0×0 (which happens when the user hasn't uploaded one
            and the bundled placeholder /lander/figma/bg.webp is empty). */}
        <div
          aria-hidden
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(120% 80% at 20% 0%, #2a1a55 0%, transparent 50%),' +
              'radial-gradient(100% 70% at 80% 100%, #5b1c3a 0%, transparent 55%),' +
              'linear-gradient(180deg, #0d0820 0%, #050309 100%)',
          }}
        />
        {/* Hero image overlay (if loadable). onError hides the <img>
            so the gradient backdrop above stays clean. */}
        {hub.heroImage && (
          <div className="fixed inset-0 pointer-events-none">
            <img
              src={proxyUrl(hub.heroImage)}
              alt=""
              className="w-full h-full object-cover"
              onLoad={e => {
                // 0×0 decode (e.g. empty placeholder file) — drop it.
                const t = e.currentTarget;
                if (t.naturalWidth === 0) t.style.display = 'none';
              }}
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/80" />
          </div>
        )}

        <main className="relative max-w-[640px] mx-auto px-4 sm:px-[30px] pt-8 sm:pt-[54px] pb-12">
          {isLoading && <LinkhubSkeleton />}
          {!isLoading && (
          <>
          {/* Hero: logo + title + description + socials */}
          <section className="text-center mb-[30px] sm:mb-[40px]">
            <div className="flex justify-center mb-3 sm:mb-4">
              <InfinityLogo />
            </div>

            <h1 className="font-medium text-[30px] sm:text-[39px] leading-[36px] sm:leading-[51.6px] whitespace-pre-line bg-clip-text text-transparent bg-gradient-to-b from-white to-[#8c8c8c]">
              {hub.heroTitle}
            </h1>

            {hub.heroSubtitle && (
              <p className="text-[14px] leading-[21px] text-white mt-5 sm:mt-6 whitespace-pre-wrap max-w-[310px] sm:max-w-[529px] mx-auto text-left sm:text-center">
                {hub.heroSubtitle}
              </p>
            )}

            {/* Social pills — 2x2 on mobile, single row on desktop (no wrap) */}
            {visibleSocials.length > 0 && (
              <div className="flex flex-wrap sm:flex-nowrap justify-center gap-x-2 sm:gap-x-[10px] gap-y-2.5 mt-6 sm:mt-7 max-w-[296px] sm:max-w-none mx-auto">
                {visibleSocials.map((s, i) => (
                  <SocialPill key={i} s={s} />
                ))}
              </div>
            )}
          </section>

          {/* Sections */}
          <div className="flex flex-col gap-[15px]">
            {visibleSections.map(section => {
              const tiles = section.tiles.filter(t => t.visible);
              const headingLink =
                section.headingLinkLabel && section.headingLinkUrl
                  ? { label: section.headingLinkLabel, url: section.headingLinkUrl }
                  : null;
              return (
                <section key={section.id} className="flex flex-col gap-[15px]">
                  {section.heading && (
                    <div className="flex items-baseline justify-between gap-3 pt-4 sm:pt-5 pb-1 sm:pb-2">
                      <h2 className="text-[16px] sm:text-[19px] leading-6 font-medium text-white">
                        {section.heading}
                      </h2>
                      {headingLink &&
                        (isExternal(headingLink.url) ? (
                          <a
                            href={headingLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] sm:text-[14px] leading-6 text-[#7c7f82] hover:text-white transition-colors whitespace-nowrap"
                          >
                            {headingLink.label}
                          </a>
                        ) : (
                          <Link
                            to={headingLink.url}
                            className="text-[13px] sm:text-[14px] leading-6 text-[#7c7f82] hover:text-white transition-colors whitespace-nowrap"
                          >
                            {headingLink.label}
                          </Link>
                        ))}
                    </div>
                  )}
                  {tiles.map(t => (
                    <Card key={t.id} tile={t} />
                  ))}
                </section>
              );
            })}
          </div>

          {/* Footer */}
          <footer className="text-center mt-10 sm:mt-[60px] pb-6 text-[14px] leading-6 text-[#7d7f83] space-y-2">
            <p>{hub.footerText}</p>
            {hub.footerLinks.length > 0 && (
              <div className="flex justify-center gap-4 flex-wrap">
                {hub.footerLinks.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target={isExternal(l.url) ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </footer>
          </>
          )}
        </main>
      </div>
    </>
  );
};

export default LinkhubPage;
