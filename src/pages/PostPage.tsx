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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Person', name: 'Данил Кочнев', url: 'https://dkochnev.com/about' },
    publisher: { '@type': 'Person', name: 'Данил Кочнев' },
    mainEntityOfPage: `https://dkochnev.com/post/${post.slug}`,
    ...(post.cover_image_url ? { image: proxyUrl(post.cover_image_url) } : {}),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ReadingProgress />
      <SEOHead
        title={post.title}
        description={post.excerpt}
        ogImage={proxyUrl(post.cover_image_url)}
        ogType="article"
        path={`/post/${post.slug}`}
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

        <TableOfContents contentHtml={post.content_html} />
        <div>
          <PostContent content={post.content} contentHtml={post.content_html} />
        </div>

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
