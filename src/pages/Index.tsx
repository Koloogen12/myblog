import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import PostCard from '@/components/posts/PostCard';
import SearchBar from '@/components/search/SearchBar';
import SEOHead from '@/components/seo/SEOHead';
import ScrollToTop from '@/components/ScrollToTop';
import { PostFeedSkeleton } from '@/components/posts/PostCardSkeleton';
import TelegramCTA from '@/components/TelegramCTA';
// import EmailSubscribe from '@/components/EmailSubscribe';
import { usePosts } from '@/hooks/usePosts';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { useHomeContent, DEFAULT_HOME } from '@/hooks/useSiteContent';
import profilePhotoFallback from '@/assets/profile-placeholder.jpg';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowRight, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type SortMode = 'newest' | 'oldest' | 'reading_time';

const SORT_KEY_BY_MODE: Record<SortMode, string> = {
  newest: 'blog.sortNewest',
  oldest: 'blog.sortOldest',
  reading_time: 'blog.sortReadingTime',
};

const Index = () => {
  const { t } = useTranslation();
  const { data: posts = [], isLoading } = usePosts({ is_published: true });
  const { data: profileData, isLoading: isProfileLoading } = useProfileSettings();
  const { data: homeData, isLoading: isHomeLoading } = useHomeContent();
  // While site_settings is fetching, don't fall back to DEFAULT_HOME — that
  // would briefly flash a stale hero ("Создаю продукты…", bundled photo)
  // before the real data arrives. We render a skeleton instead.
  const isHeroLoading = isHomeLoading || isProfileLoading;
  const home = homeData ?? DEFAULT_HOME;
  const profilePhoto = profileData?.avatarUrl || profilePhotoFallback;
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortMode) {
      case 'oldest':
        return new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime();
      case 'reading_time':
        return (b.reading_time || 0) - (a.reading_time || 0);
      default:
        return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
    }
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Блог Данила Кочнева',
    description:
      'Блог серийного IT-предпринимателя. О продуктах, стартапах, AI, продуктовом мышлении и опыте фаундера в реальном времени.',
    url: 'https://dkochnev.com/blog',
    inLanguage: 'ru-RU',
    author: {
      '@type': 'Person',
      name: 'Данил Кочнев',
      url: 'https://dkochnev.com',
    },
    publisher: {
      '@type': 'Person',
      name: 'Данил Кочнев',
    },
    blogPost: posts.map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `https://dkochnev.com/post/${p.slug}`,
      datePublished: p.published_at,
      author: { '@type': 'Person', name: 'Данил Кочнев' },
    })),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={t('blog.metaTitle')}
        description={t('blog.metaDescription')}
        path="/blog"
        ogType="blog"
        jsonLd={jsonLd}
      />
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          {/* Sidebar */}
          <div className="hidden md:block w-48 flex-shrink-0 sticky top-20 self-start">
            <Sidebar />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Featured promo card — WOW hero */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 mb-8 group"
            >
              {/* Decorative gradient orbs */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/8 rounded-full blur-3xl group-hover:bg-primary/12 transition-colors duration-700" />
              <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-primary/5 rounded-full blur-2xl" />

              {isHeroLoading ? (
                /* Skeleton — same shape as the real hero so no layout shift */
                <div className="relative flex flex-col sm:flex-row gap-6 animate-pulse">
                  <div className="flex-1 space-y-3">
                    <div className="h-3 w-40 bg-muted rounded" />
                    <div className="h-7 w-3/4 bg-muted rounded" />
                    <div className="h-7 w-2/3 bg-muted rounded" />
                    <div className="space-y-2 pt-2">
                      <div className="h-3 w-full bg-muted rounded" />
                      <div className="h-3 w-11/12 bg-muted rounded" />
                      <div className="h-3 w-4/5 bg-muted rounded" />
                    </div>
                    <div className="h-10 w-32 bg-muted rounded-xl mt-3" />
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-muted" />
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    {home.heroKicker && (
                      <p className="text-xs text-primary font-medium mb-2 tracking-wide uppercase">
                        {home.heroKicker}
                      </p>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground mb-3 leading-tight">
                      {(() => {
                        const lines = home.heroTitle.split('\n');
                        return lines.map((line, i) =>
                          i === lines.length - 1 && lines.length > 1 ? (
                            <span
                              key={i}
                              className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                            >
                              {line}
                            </span>
                          ) : (
                            <span key={i}>
                              {line}
                              {i < lines.length - 1 && <br />}
                            </span>
                          ),
                        );
                      })()}
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      {home.heroSubtitle}
                    </p>
                    <Link
                      to={home.heroCtaLink}
                      className="inline-flex items-center gap-2 text-sm px-5 py-2.5 bg-foreground text-background rounded-xl font-medium hover:opacity-80 transition-all hover:gap-3 group/btn"
                    >
                      {home.heroCtaText.replace(/\s*→\s*$/, '')}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                  <div className="flex-shrink-0">
                    <motion.img
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      src={profilePhoto}
                      alt="Данил Кочнев"
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shadow-lg"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Search */}
            <div className="mb-6">
              <SearchBar />
            </div>

            {/* Sort controls */}
            {!isLoading && sortedPosts.length > 1 && (
              <div className="flex items-center gap-2 mb-4">
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                {(Object.keys(SORT_KEY_BY_MODE) as SortMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                      sortMode === mode
                        ? 'bg-secondary text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(SORT_KEY_BY_MODE[mode])}
                  </button>
                ))}
              </div>
            )}

            {/* Posts feed */}
            {isLoading ? (
              <PostFeedSkeleton />
            ) : (
              <div className="divide-y divide-border">
                {sortedPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Subscribe CTA */}
            <div className="mt-12">
              <TelegramCTA />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
