import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PostContent from '@/components/posts/PostContent';
import ShareButtons from '@/components/posts/ShareButtons';
import PostNavigation from '@/components/posts/PostNavigation';
import RelatedPosts from '@/components/posts/RelatedPosts';
import SEOHead from '@/components/seo/SEOHead';
import ReadingProgress from '@/components/ReadingProgress';
import ScrollToTop from '@/components/ScrollToTop';
import TelegramCTA from '@/components/TelegramCTA';
// import EmailSubscribe from '@/components/EmailSubscribe';
import TableOfContents from '@/components/posts/TableOfContents';
import { usePost, usePosts } from '@/hooks/usePosts';
import { useTranslation } from 'react-i18next';
import { useCategoryMap } from '@/hooks/useCategories';
import { proxyUrl } from '@/lib/storage';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath } from '@/lib/locale';
import { ArrowLeft, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = usePost(slug!);
  const { data: allPosts = [] } = usePosts({ is_published: true });
  const categoryMap = useCategoryMap();
  const { t } = useTranslation();
  const locale = useLocale();
  const lp = (path: string) => localizedPath(path, locale);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!post || isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('post.notFound')}</h1>
          <Link to={lp('/')} className="text-primary hover:underline">{t('common.backHome')}</Link>
        </div>
      </div>
    );
  }

  const currentIndex = allPosts.findIndex(p => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : undefined;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : undefined;

  const relatedPosts = allPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const date = new Date(post.published_at || post.created_at);
  const formattedDate = date.toLocaleDateString(locale === 'en' ? 'en-US' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // SEO fields override the editorial ones when filled, so the SERP snippet
  // can differ from the on-page headline without touching the article itself.
  const metaTitle = post.seo_title || post.title;
  const metaDescription = post.seo_description || post.tldr || post.excerpt;
  const socialImage = proxyUrl(post.og_image || post.cover_image_url);
  const faqItems = (post.faq ?? []).filter(f => f?.question && f?.answer);
  const wasUpdated =
    post.updated_at &&
    post.published_at &&
    new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() >
      24 * 60 * 60 * 1000;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metaTitle,
    description: metaDescription,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Person', name: 'Данил Кочнев', url: 'https://dkochnev.com/about' },
    publisher: { '@type': 'Person', name: 'Данил Кочнев' },
    mainEntityOfPage: `https://dkochnev.com/post/${post.slug}`,
    inLanguage: locale === 'en' ? 'en' : 'ru',
    ...(post.reading_time ? { timeRequired: `PT${post.reading_time}M` } : {}),
    ...(post.keywords?.length ? { keywords: post.keywords.join(', ') } : {}),
    ...(socialImage ? { image: socialImage } : {}),
  };

  // Breadcrumbs give search engines the hierarchy and render as a path in
  // results instead of a bare URL.
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Блог', item: 'https://dkochnev.com/blog' },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryMap[post.category] || post.category,
        item: `https://dkochnev.com/tag/${post.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://dkochnev.com/post/${post.slug}`,
      },
    ],
  };

  // FAQPage is one of the highest-leverage schemas for AI answer engines:
  // it hands them ready-made question/answer pairs to quote.
  const faqSchema = faqItems.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }
    : null;

  const jsonLd = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ReadingProgress />
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        keywords={post.keywords?.length ? post.keywords.join(', ') : undefined}
        ogImage={socialImage}
        ogType="article"
        path={`/post/${post.slug}`}
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        jsonLd={jsonLd}
      />
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8 flex-1 w-full">
        <Link to={lp('/blog')} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> {t('post.allPosts')}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={lp(`/tag/${post.category}`)} className="text-primary hover:underline">
              {categoryMap[post.category] || post.category}
            </Link>
            <span>·</span>
            <span>{formattedDate}</span>
            <span>·</span>
            <span>{t('common.readMinutesShort', { count: post.reading_time || 0 })}</span>
            {/* Freshness is weighted heavily by AI answer engines, so an
                updated article says so explicitly. */}
            {wasUpdated && (
              <>
                <span>·</span>
                <span>
                  {t('post.updatedOn')}{' '}
                  {new Date(post.updated_at).toLocaleDateString(
                    locale === 'en' ? 'en-US' : 'ru-RU',
                    { day: 'numeric', month: 'long', year: 'numeric' },
                  )}
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>

          {post.category === 'books' && post.rating && (
            <div className="inline-flex items-center gap-1.5 text-sm text-primary mb-4">
              <Star className="w-4 h-4 fill-primary" />
              {post.rating} / 10
            </div>
          )}

          {/* Share buttons */}
          <div className="mb-8 pt-2">
            <ShareButtons title={post.title} url={`/post/${post.slug}`} />
          </div>
        </motion.div>

        {/* TL;DR — a self-contained 40-60 word answer placed above the fold.
            AI systems extract passages, not pages, so leading with a complete
            answer is what makes a post quotable. */}
        {post.tldr && (
          <aside className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              {t('post.tldr')}
            </p>
            <p className="text-[15px] leading-relaxed text-foreground/90">{post.tldr}</p>
          </aside>
        )}

        <TableOfContents contentHtml={post.content_html} />
        <div>
          <PostContent content={post.content} contentHtml={post.content_html} />
        </div>

        {/* FAQ — mirrors the FAQPage schema emitted above. Real questions in
            natural language, because that's how people query AI assistants. */}
        {faqItems.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold font-display mb-6">{t('post.faqHeading')}</h2>
            <div className="space-y-5">
              {faqItems.map((f, i) => (
                <div key={i}>
                  <h3 className="text-base font-semibold text-foreground mb-1.5">
                    {f.question}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">
                    {f.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Subscribe CTA */}
        <div className="mt-12">
          <TelegramCTA />
        </div>

        {/* Bottom share */}
        <div className="mt-10 pt-6 border-t border-border">
          <ShareButtons title={post.title} url={`/post/${post.slug}`} />
        </div>

        {/* Prev / Next navigation */}
        <PostNavigation prevPost={prevPost} nextPost={nextPost} />

        {/* Related posts */}
        <RelatedPosts posts={relatedPosts} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default PostPage;
