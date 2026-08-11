import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Post } from '@/types';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath } from '@/lib/locale';

interface PostNavigationProps {
  prevPost?: Post;
  nextPost?: Post;
}

const PostNavigation = ({ prevPost, nextPost }: PostNavigationProps) => {
  const { t } = useTranslation();
  const locale = useLocale();
  if (!prevPost && !nextPost) return null;

  return (
    <nav className="grid grid-cols-2 gap-4 mt-12">
      {prevPost ? (
        <Link
          to={localizedPath(`/post/${prevPost.slug}`, locale)}
          className="group flex flex-col gap-1 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
        >
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> {t('post.prev')}
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {prevPost.title}
          </span>
        </Link>
      ) : <div />}

      {nextPost ? (
        <Link
          to={localizedPath(`/post/${nextPost.slug}`, locale)}
          className="group flex flex-col gap-1 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors text-right"
        >
          <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
            {t('post.next')} <ArrowRight className="w-3 h-3" />
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {nextPost.title}
          </span>
        </Link>
      ) : <div />}
    </nav>
  );
};

export default PostNavigation;
