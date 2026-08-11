import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, MoreHorizontal } from 'lucide-react';
import { MOCK_CONTENT, PLATFORM_CONFIG, STATUS_CONFIG } from '@/lib/content-studio-data';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ContentStudioSchedule = () => {
  const navigate = useNavigate();

  const scheduled = MOCK_CONTENT.filter((i) => i.scheduled_at || i.status === 'queued');
  const published = MOCK_CONTENT.filter((i) => i.status === 'published');
  const drafts = MOCK_CONTENT.filter((i) => i.status === 'writing' || i.status === 'ready');

  // Group scheduled items by day
  const byDay = new Map<string, typeof scheduled>();
  scheduled.forEach((item) => {
    const date = item.scheduled_at ? format(new Date(item.scheduled_at), 'yyyy-MM-dd') : 'unscheduled';
    if (!byDay.has(date)) byDay.set(date, []);
    byDay.get(date)!.push(item);
  });

  const sortedDays = [...byDay.keys()].sort();

  // Mock some future empty days
  const days = ['2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14', '2026-03-15'];
  days.forEach((d) => { if (!byDay.has(d)) byDay.set(d, []); });
  const allDays = [...new Set([...sortedDays, ...days])].sort();

  const formatDayHeader = (dateStr: string) => {
    if (dateStr === 'unscheduled') return 'Без даты';
    const d = new Date(dateStr);
    const today = new Date('2026-03-10');
    const tomorrow = new Date('2026-03-11');
    if (dateStr === format(today, 'yyyy-MM-dd')) return `Сегодня, ${format(d, 'd MMMM', { locale: ru })}`;
    if (dateStr === format(tomorrow, 'yyyy-MM-dd')) return `Завтра, ${format(d, 'd MMMM', { locale: ru })}`;
    return format(d, 'EEEE, d MMMM', { locale: ru });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/content-studio')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Content Studio
          </button>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Очередь публикаций</h1>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left — Timeline */}
        <div className="flex-1 space-y-4">
          {allDays.map((day) => {
            const items = byDay.get(day) || [];
            return (
              <div key={day}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 pb-1 border-b border-border">
                  {formatDayHeader(day)}
                </h3>
                {items.length > 0 ? (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2.5 hover:border-primary/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/admin/content-studio/${item.id}`)}
                      >
                        <span className="text-xs text-muted-foreground w-12 flex-shrink-0 font-mono">
                          {item.scheduled_at ? format(new Date(item.scheduled_at), 'HH:mm') : '—'}
                        </span>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {item.platforms.slice(0, 1).map((p) => (
                            <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded ${PLATFORM_CONFIG[p].color}`}>
                              {(() => { const PIcon = PLATFORM_CONFIG[p].Icon; return <PIcon className="w-3 h-3 inline" />; })()} {PLATFORM_CONFIG[p].label}
                            </span>
                          ))}
                          <span className="text-sm font-medium truncate">{item.title}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="p-1 rounded hover:bg-muted">
                              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Изменить время</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/admin/content-studio/${item.id}`)}>Открыть</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Удалить</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-border rounded-lg p-4 text-xs text-muted-foreground text-center">
                    + Запланировать публикацию
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right — Stats */}
        <div className="w-64 flex-shrink-0 space-y-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Эта неделя</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Запланировано</span>
                <span className="font-medium text-foreground">{scheduled.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Опубликовано</span>
                <span className="font-medium text-foreground">{published.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Черновиков</span>
                <span className="font-medium text-foreground">{drafts.length}</span>
              </div>
            </div>
          </div>
          {scheduled.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Следующий пост</h3>
              <p className="text-sm font-medium">{scheduled[0].title}</p>
              <p className="text-xs text-muted-foreground">
                {scheduled[0].scheduled_at && format(new Date(scheduled[0].scheduled_at), 'd MMM, HH:mm', { locale: ru })}
                {' • '}
                {scheduled[0].platforms.map((p) => PLATFORM_CONFIG[p].shortLabel).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentStudioSchedule;
