import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePosts } from '@/hooks/usePosts';
import { useCategoryMap } from '@/hooks/useCategories';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath } from '@/lib/locale';

interface SearchBarProps {
  onNavigate?: () => void;
}

const SearchBar = ({ onNavigate }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: posts = [] } = usePosts({ is_published: true });
  const categoryMap = useCategoryMap();
  const { t } = useTranslation();
  const locale = useLocale();

  const results = query.length >= 2
    ? posts.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('common.searchPlaceholder')}
          className="w-full pl-9 pr-8 py-2 text-sm bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.length > 0 ? (
            results.map(post => (
              <Link
                key={post.id}
                to={localizedPath(`/post/${post.slug}`, locale)}
                onClick={() => { setIsOpen(false); setQuery(''); onNavigate?.(); }}
                className="block px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-0"
              >
                <p className="text-xs text-muted-foreground mb-0.5">{categoryMap[post.category] || post.category}</p>
                <p className="text-sm font-medium text-foreground line-clamp-1">{post.title}</p>
              </Link>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t('blog.noSearchResults')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
