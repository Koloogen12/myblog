import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Post } from '@/types';
import { useCategoryMap } from '@/hooks/useCategories';
import { proxyUrl } from '@/lib/storage';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath } from '@/lib/locale';
import { Star } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const categoryMap = useCategoryMap();
  const locale = useLocale();
  const { t } = useTranslation();
  const date = new Date(post.published_at || post.created_at);
  const formattedDate = date.toLocaleDateString(locale === 'en' ? 'en-US' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <Link to={localizedPath(`/post/${post.slug}`, locale)} className="block group">
      <article className="py-6 flex gap-5 items-start transition-all duration-200 rounded-xl -mx-3 px-3 hover:bg-accent/50">
        {/* Cover */}
        {post.cover_image_url && (
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
            <img 
              src={proxyUrl(post.cover_image_url)}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Meta line */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            <span>{categoryMap[post.category] || post.category}</span>
            <span>—</span>
            <span>{t('common.readMinutes', { count: post.reading_time || 0 })},</span>
            <span className="ml-1">{formattedDate}</span>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-snug font-display mb-1.5">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Rating for books */}
          {post.category === 'books' && post.rating && (
            <div className="mt-2 inline-flex items-center gap-1">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-2xl font-bold text-primary font-display">{post.rating}</span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default PostCard;
