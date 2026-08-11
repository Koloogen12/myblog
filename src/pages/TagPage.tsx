import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import PostCard from '@/components/posts/PostCard';
import SearchBar from '@/components/search/SearchBar';
import SEOHead from '@/components/seo/SEOHead';
import ScrollToTop from '@/components/ScrollToTop';
import { usePosts } from '@/hooks/usePosts';
import { useCategoryMap } from '@/hooks/useCategories';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const categoryMap = useCategoryMap();
  const categoryName = categoryMap[slug!] || slug;

  const { data: posts = [], isLoading } = usePosts({ is_published: true, category: slug });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={categoryName} description={`Все посты в рубрике «${categoryName}»`} path={`/tag/${slug}`} />
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          <div className="hidden md:block w-48 flex-shrink-0 sticky top-20 self-start">
            <Sidebar />
          </div>
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold font-display text-foreground mb-6"
            >
              {categoryName}
            </motion.h1>

            <div className="mb-6">
              <SearchBar />
            </div>

            {isLoading ? (
              <p className="text-muted-foreground py-12 text-center">Загрузка...</p>
            ) : (
              <div className="divide-y divide-border">
                {posts.length > 0 ? (
                  posts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))
                ) : (
                  <div className="py-16 text-center">
                    <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">Пока нет постов в этой рубрике.</p>
                    <p className="text-sm text-muted-foreground">Скоро здесь появится что-то интересное</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default TagPage;
