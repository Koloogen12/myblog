import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePosts, useDeletePost } from '@/hooks/usePosts';
import { useCategories, useCategoryMap } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Eye, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PostsList = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const { data: allPosts = [], isLoading } = usePosts();
  const { data: categories = [] } = useCategories();
  const categoryMap = useCategoryMap();
  const deletePost = useDeletePost();

  let posts = [...allPosts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (filterCategory !== 'all') {
    posts = posts.filter(p => p.category === filterCategory);
  }
  if (filterStatus === 'published') {
    posts = posts.filter(p => p.is_published);
  } else if (filterStatus === 'draft') {
    posts = posts.filter(p => !p.is_published);
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Удалить пост? Это действие нельзя отменить.')) return;
    deletePost.mutate(id, {
      onSuccess: () => toast.success('Пост удалён'),
      onError: () => toast.error('Ошибка при удалении поста'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Посты</h1>
        <Link to="/admin/posts/new">
          <Button size="sm" className="gap-1">
            <Plus className="w-4 h-4" /> Новый пост
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1 rounded-md text-xs transition-colors ${filterCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-surface-hover'}`}
        >
          Все
        </button>
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setFilterCategory(cat.slug)}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${filterCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-surface-hover'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'published', 'draft'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-surface-hover'}`}
          >
            {status === 'all' ? 'Все' : status === 'published' ? 'Опубликовано' : 'Черновики'}
          </button>
        ))}
      </div>

      {/* Posts list */}
      <div className="border border-border rounded-lg divide-y divide-border">
        {posts.map(post => (
          <div key={post.id} className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-primary">{categoryMap[post.category] || post.category}</span>
                {post.excerpt && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">{post.excerpt}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
              </span>
              {post.is_published ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              )}
              <Link to={`/admin/posts/${post.id}/edit`} className="p-1.5 hover:bg-secondary rounded transition-colors">
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
              <button
                className="p-1.5 hover:bg-secondary rounded transition-colors"
                onClick={() => handleDelete(post.id)}
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <Link to={`/post/${post.slug}`} target="_blank" className="p-1.5 hover:bg-secondary rounded transition-colors">
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Нет постов по выбранным фильтрам
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsList;
