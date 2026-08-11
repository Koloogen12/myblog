import { Link } from 'react-router-dom';
import { Post } from '@/types';
import { useCategoryMap } from '@/hooks/useCategories';
import { proxyUrl } from '@/lib/storage';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath } from '@/lib/locale';

interface RelatedPostsProps {
  posts: Post[];
}

const RelatedPosts = ({ posts }: RelatedPostsProps) => {
  const categoryMap = useCategoryMap();
  const locale = useLocale();
  if (posts.length === 0) return null;

  return (
    <section className="mt-12">
      <h3 className="text-lg font-semibold font-display mb-4">Похожие посты</h3>
      <div className="grid gap-3">
        {posts.map(post => (
          <Link
            key={post.id}
            to={localizedPath(`/post/${post.slug}`, locale)}
            className="group flex gap-4 items-start p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
          >
            {post.cover_image_url && (
              <img
                src={proxyUrl(post.cover_image_url)}
                alt={post.title}
                className="w-12 h-14 rounded object-cover flex-shrink-0"
                loading="lazy"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1">{categoryMap[post.category] || post.category}</p>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;
