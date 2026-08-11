import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import SEOHead from '@/components/seo/SEOHead';
import ScrollToTop from '@/components/ScrollToTop';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import profilePhotoFallback from '@/assets/profile-placeholder.jpg';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { useAboutContent, DEFAULT_ABOUT } from '@/hooks/useSiteContent';
import { RichContent } from '@/components/RichContent';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath } from '@/lib/locale';
import { Send, Linkedin, Instagram, Newspaper, Mail, ExternalLink, ArrowRight } from 'lucide-react';

const socialsFallback = [
  { name: 'Telegram', url: 'https://t.me/kochnev_blog', Icon: Send },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/kochnefff/', Icon: Linkedin },
  { name: 'Instagram', url: 'https://www.instagram.com/kochnefff/', Icon: Instagram },
  { name: 'VC.ru', url: 'https://vc.ru/u/618305-danil-kochnev', Icon: Newspaper },
  { name: 'Email', url: 'mailto:ceo@themono.ru', Icon: Mail },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const AboutPage = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const lp = (path: string) => localizedPath(path, locale);
  const { data: profileData, isLoading: isProfileLoading } = useProfileSettings();
  const { data: aboutData, isLoading: isAboutLoading } = useAboutContent();
  // Don't render default content while the real one is still in flight — that
  // would briefly flash a stale name/photo/bio before Supabase responds.
  const isHeroLoading = isAboutLoading || isProfileLoading;
  const about = aboutData ?? DEFAULT_ABOUT;
  const profilePhoto = profileData?.avatarUrl || profilePhotoFallback;

  // Socials from profileSettings → fallback to static list
  const dynamicSocials = Object.entries(profileData?.socials || {})
    .filter(([, url]) => url)
    .map(([key, url]) => {
      const map: Record<string, { name: string; Icon: typeof Send }> = {
        telegram_channel: { name: 'Telegram', Icon: Send },
        telegram: { name: 'Telegram (личный)', Icon: Send },
        linkedin: { name: 'LinkedIn', Icon: Linkedin },
        instagram: { name: 'Instagram', Icon: Instagram },
        vcru: { name: 'VC.ru', Icon: Newspaper },
        email: { name: 'Email', Icon: Mail },
      };
      const info = map[key] || { name: key, Icon: ExternalLink };
      const href =
        key === 'email'
          ? `mailto:${url}`
          : key === 'telegram_channel' && !url.startsWith('http')
            ? `https://t.me/${url.replace(/^@/, '')}`
            : url;
      return { name: info.name, url: href, Icon: info.Icon };
    });

  const socials = dynamicSocials.length ? dynamicSocials : socialsFallback;
  // mainBio is rendered via <RichContent> below — supports both HTML
  // (from rich-text editor) and legacy plain text with \n\n breaks.
  const mainBioPlainPreview = about.mainBio
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Обо мне"
        description={about.secondaryBio?.replace(/<[^>]+>/g, ' ').trim() || mainBioPlainPreview}
        path="/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: about.heading,
          url: 'https://dkochnev.com/about',
          jobTitle: 'Serial Entrepreneur',
          sameAs: socials.filter(s => !s.url.startsWith('mailto')).map(s => s.url),
        }}
      />
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          {/* Left sidebar (same as blog index) */}
          <div className="hidden md:block w-48 flex-shrink-0 sticky top-20 self-start">
            <Sidebar />
          </div>

          {/* Content column */}
          <div className="flex-1 min-w-0 max-w-3xl">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          {isHeroLoading ? (
            /* Skeleton matches the real hero geometry — no layout shift */
            <div className="animate-pulse">
              <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-muted mb-6" />
              <div className="h-8 w-2/3 bg-muted rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-11/12 bg-muted rounded" />
                <div className="h-3 w-10/12 bg-muted rounded" />
                <div className="h-3 w-9/12 bg-muted rounded" />
              </div>
            </div>
          ) : (
            <>
              <img
                src={profilePhoto}
                alt={about.heading}
                className="w-40 h-40 sm:w-44 sm:h-44 rounded-full object-cover border border-border mb-6"
              />
              <h1 className="text-3xl font-bold font-display mb-4">{about.heading}</h1>
              <RichContent
                value={about.mainBio}
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed prose-p:my-2 prose-headings:text-foreground prose-headings:font-display prose-headings:mt-4 prose-headings:mb-2 prose-strong:text-foreground prose-blockquote:border-primary prose-blockquote:text-foreground/80 prose-a:text-primary prose-img:rounded-lg"
              />
            </>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {about.stats.map((stat, i) => (
            <motion.div
              key={`${stat.label}-${i}`}
              custom={i}
              variants={fadeUp}
              className="text-center p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <p className="text-3xl font-bold font-display text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Secondary bio + blog description */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4 text-muted-foreground leading-relaxed mb-12"
        >
          <RichContent
            value={about.secondaryBio}
            className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-strong:text-foreground prose-a:text-primary"
          />
          <RichContent
            value={about.blogDescription}
            className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-strong:text-foreground prose-a:text-primary"
          />
        </motion.div>

        {/* Timeline */}
        <motion.h2
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-semibold font-display mb-6"
        >
          {about.timelineHeading}
        </motion.h2>
        <div className="relative mb-12">
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-6">
            {about.timeline.map((item, i) => (
              <motion.div
                key={`${item.year}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex gap-4 items-start relative"
              >
                <div className="w-9 h-9 rounded-full border-2 border-primary bg-background flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 z-10">
                  {item.age || item.year.slice(-2)}
                </div>
                <div className="pt-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <span className="text-xs text-muted-foreground">{item.year}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    >
                      {item.url.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-semibold font-display mb-4">Контакты</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {socials.map(s => (
              <a
                key={s.name}
                href={s.url}
                target={s.url.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors group"
              >
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <s.Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {s.name}
                </span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        {about.ctaHeading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 mb-8"
          >
            <h3 className="text-xl font-bold font-display mb-2">{about.ctaHeading}</h3>
            {about.ctaText && (
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {about.ctaText}
              </p>
            )}
            {about.ctaButtonText && about.ctaButtonLink && (
              <a
                href={about.ctaButtonLink}
                target={about.ctaButtonLink.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm px-5 py-2.5 bg-foreground text-background rounded-xl font-medium hover:opacity-80 transition-all hover:gap-3"
              >
                {about.ctaButtonText.replace(/\s*→\s*$/, '')}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </motion.div>
        )}

        <div className="pt-4">
          <Link
            to={lp('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('common.backHome')}
          </Link>
        </div>
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default AboutPage;
