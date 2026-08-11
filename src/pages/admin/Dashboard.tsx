import { usePosts } from '@/hooks/usePosts';
import { useCategoryMap } from '@/hooks/useCategories';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, FileText, PenTool, TrendingUp, Plus,
  ArrowRight, BookOpen, Lightbulb, MessageSquare, BarChart3,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { data: posts = [], isLoading } = usePosts();

  const published = posts.filter(p => p.is_published);
  const categoryMap = useCategoryMap();
  const drafts = posts.filter(p => !p.is_published);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  const stats = [
    { label: 'Опубликовано', value: published.length, Icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Черновики', value: drafts.length, Icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Книги', value: posts.filter(p => p.category === 'books').length, Icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Мысли', value: posts.filter(p => p.category === 'thoughts').length, Icon: Lightbulb, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const quickActions = [
    { label: 'Написать пост', to: '/admin/posts/new', Icon: PenTool, description: 'Новая публикация' },
    { label: 'Новый спринт', to: '/admin/sprints/new', Icon: TrendingUp, description: 'Еженедельный отчёт' },
    { label: 'Content Studio', to: '/admin/content-studio', Icon: MessageSquare, description: 'Контент-план' },
    { label: 'Все посты', to: '/admin/posts', Icon: FileText, description: 'Управление' },
  ];

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">{greeting}, Данил</h1>
        <p className="text-sm text-muted-foreground mt-1">
          У тебя {drafts.length} черновик{drafts.length === 1 ? '' : drafts.length >= 2 && drafts.length <= 4 ? 'а' : 'ов'} в работе
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map(action => (
          <Link
            key={action.to}
            to={action.to}
            className="group border border-border rounded-lg p-4 hover:border-primary/40 hover:bg-accent/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <action.Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="border border-border rounded-lg p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Последние посты</h2>
          <Link to="/admin/posts">
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
              Все посты <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="border border-border rounded-lg divide-y divide-border">
          {recentPosts.map(post => (
            <Link
              key={post.id}
              to={`/admin/posts/${post.id}/edit`}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{categoryMap[post.category] || post.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </span>
                {post.is_published ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
