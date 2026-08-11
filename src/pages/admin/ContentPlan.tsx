import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, MoreHorizontal, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  MOCK_CONTENT_PLAN, CONTENT_TYPE_CONFIG, PLATFORM_CONFIG, STATUS_CONFIG,
  getDayShort, getWeekMonday, getWeekDays, formatWeekHeader, isToday,
  type ContentPlanItem, type ContentType, type ContentPlatform, type ContentStatus,
} from '@/lib/content-plan-data';

const ALL_CONTENT_TYPES: ContentType[] = ['thoughts', 'meta', 'sprint', 'books', 'carousel', 'video', 'reel'];
const ALL_PLATFORMS: ContentPlatform[] = ['site', 'telegram', 'instagram', 'linkedin', 'twitter'];
const ALL_STATUSES: ContentStatus[] = ['idea', 'draft', 'scheduled', 'published'];

const ContentPlan = () => {
  const [items, setItems] = useState<ContentPlanItem[]>(MOCK_CONTENT_PLAN);
  const [view, setView] = useState<'list' | 'week'>('list');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentPlanItem | null>(null);

  // Week view state
  const [weekOffset, setWeekOffset] = useState(0);
  const baseMonday = '2026-03-10';
  const currentMonday = useMemo(() => {
    const d = new Date(baseMonday + 'T00:00:00');
    d.setDate(d.getDate() + weekOffset * 7);
    return d.toISOString().split('T')[0];
  }, [weekOffset]);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState<Date | undefined>();
  const [formType, setFormType] = useState<ContentType>('thoughts');
  const [formPlatforms, setFormPlatforms] = useState<ContentPlatform[]>([]);
  const [formStatus, setFormStatus] = useState<ContentStatus>('idea');
  const [formNotes, setFormNotes] = useState('');

  // Stats
  const stats = useMemo(() => ({
    idea: items.filter(i => i.status === 'idea').length,
    draft: items.filter(i => i.status === 'draft').length,
    scheduled: items.filter(i => i.status === 'scheduled').length,
    published: items.filter(i => i.status === 'published').length,
  }), [items]);

  // Group items by week for list view
  const groupedByWeek = useMemo(() => {
    const sorted = [...items].sort((a, b) => b.planned_date.localeCompare(a.planned_date));
    const groups: Record<string, ContentPlanItem[]> = {};
    sorted.forEach(item => {
      const monday = getWeekMonday(item.planned_date);
      if (!groups[monday]) groups[monday] = [];
      groups[monday].push(item);
    });
    // Sort groups by monday desc
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([monday, weekItems]) => ({
        monday,
        items: weekItems.sort((a, b) => a.planned_date.localeCompare(b.planned_date)),
      }));
  }, [items]);

  // Week view items
  const weekDays = useMemo(() => getWeekDays(currentMonday), [currentMonday]);
  const weekItems = useMemo(() => {
    const map: Record<string, ContentPlanItem[]> = {};
    weekDays.forEach(d => { map[d] = []; });
    items.forEach(item => {
      if (map[item.planned_date]) map[item.planned_date].push(item);
    });
    return map;
  }, [items, weekDays]);

  const openNew = (preDate?: string) => {
    setEditingItem(null);
    setFormTitle('');
    setFormDate(preDate ? new Date(preDate + 'T00:00:00') : undefined);
    setFormType('thoughts');
    setFormPlatforms([]);
    setFormStatus('idea');
    setFormNotes('');
    setSheetOpen(true);
  };

  const openEdit = (item: ContentPlanItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDate(new Date(item.planned_date + 'T00:00:00'));
    setFormType(item.content_type);
    setFormPlatforms([...item.platforms]);
    setFormStatus(item.status);
    setFormNotes(item.notes || '');
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim() || !formDate) {
      toast.error('Заполните название и дату');
      return;
    }
    const dateStr = formDate.toISOString().split('T')[0];
    if (editingItem) {
      setItems(prev => prev.map(i =>
        i.id === editingItem.id
          ? { ...i, title: formTitle, planned_date: dateStr, content_type: formType, platforms: formPlatforms, status: formStatus, notes: formNotes }
          : i
      ));
      toast.success('Запись обновлена');
    } else {
      setItems(prev => [...prev, {
        id: `cp-${Date.now()}`,
        title: formTitle,
        planned_date: dateStr,
        content_type: formType,
        platforms: formPlatforms,
        status: formStatus,
        notes: formNotes,
      }]);
      toast.success('Запись добавлена');
    }
    setSheetOpen(false);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('Запись удалена');
  };

  const togglePlatform = (p: ContentPlatform) => {
    setFormPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  // Shared components
  const PlatformPills = ({ platforms }: { platforms: ContentPlatform[] }) => (
    <div className="flex gap-1">
      {platforms.map(p => (
        <span key={p} className={`text-xs px-1.5 py-0.5 rounded ${PLATFORM_CONFIG[p].className}`}>
          {PLATFORM_CONFIG[p].shortLabel}
        </span>
      ))}
    </div>
  );

  const StatusBadge = ({ status }: { status: ContentStatus }) => {
    const config = STATUS_CONFIG[status];
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
        {config.label}
      </span>
    );
  };

  const renderListItem = (item: ContentPlanItem) => (
    <div
      key={item.id}
      className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer group"
      onClick={() => openEdit(item)}
    >
      {/* Date */}
      <span className="text-xs text-muted-foreground w-10 flex-shrink-0">{getDayShort(item.planned_date)}</span>

      {/* Status dot */}
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[item.status].dotClass}`} />

      {/* Type icon */}
      {(() => { const TypeIcon = CONTENT_TYPE_CONFIG[item.content_type].Icon; return <TypeIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />; })()}

      {/* Title */}
      <span className="text-sm font-medium flex-1 min-w-0 truncate">{item.title}</span>

      {/* Platform pills */}
      <PlatformPills platforms={item.platforms} />

      {/* Status */}
      <StatusBadge status={item.status} />

      {/* Actions */}
      {(item.status === 'draft' || item.status === 'scheduled') && item.post_slug && (
        <Link to={`/post/${item.post_slug}`} className="text-xs text-primary hover:underline" onClick={e => e.stopPropagation()}>
          Открыть →
        </Link>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => e.stopPropagation()}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openEdit(item)}>Редактировать</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id)}>Удалить</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Контент-план</h1>
        <div className="flex items-center gap-3">
          <Tabs value={view} onValueChange={v => setView(v as 'list' | 'week')}>
            <TabsList className="h-8">
              <TabsTrigger value="list" className="text-xs px-3">Список</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3">Неделя</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" className="gap-1" onClick={() => openNew()}>
            <Plus className="w-4 h-4" /> Добавить запись
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 mb-6">
        <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">💡 {stats.idea} идей</span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500">✏️ {stats.draft} черновик</span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500">📅 {stats.scheduled} запланировано</span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">✅ {stats.published} опубликовано</span>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="space-y-6">
          {groupedByWeek.map(({ monday, items: weekItems }) => (
            <div key={monday}>
              <div className="text-xs font-semibold text-muted-foreground border-b border-border pb-2 mb-1 sticky top-0 bg-background z-10">
                Неделя {formatWeekHeader(monday)}
              </div>
              <div className="divide-y divide-border/50">
                {weekItems.map(renderListItem)}
              </div>
            </div>
          ))}
          {groupedByWeek.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">Нет записей</div>
          )}
        </div>
      )}

      {/* WEEK VIEW */}
      {view === 'week' && (
        <div>
          {/* Week navigation */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(o => o - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">{formatWeekHeader(currentMonday)} 2026</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekOffset(o => o + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* 7-column grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {weekDays.map((day, i) => {
              const dayDate = new Date(day + 'T00:00:00');
              const dayItems = weekItems[day] || [];
              const today = isToday(day);

              return (
                <div key={day} className="bg-background min-h-[160px] flex flex-col">
                  {/* Day header */}
                  <div className={cn(
                    'text-center py-2 border-b border-border text-xs',
                    today && 'bg-primary/10'
                  )}>
                    <div className="text-muted-foreground">{DAY_NAMES[i]}</div>
                    <div className={cn('font-semibold', today && 'text-primary')}>{dayDate.getDate()}</div>
                  </div>

                  {/* Items */}
                  <div className="flex-1 p-1 space-y-1">
                    {dayItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => openEdit(item)}
                        className={cn(
                          'p-1.5 rounded text-xs cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all',
                          STATUS_CONFIG[item.status].bgClass,
                          item.status === 'idea' && 'border border-border'
                        )}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[item.status].dotClass}`} />
                          <span className="truncate font-medium">{item.title}</span>
                        </div>
                        <PlatformPills platforms={item.platforms} />
                      </div>
                    ))}

                    {/* Empty day hover */}
                    {dayItems.length === 0 && (
                      <div
                        onClick={() => openNew(day)}
                        className="h-full min-h-[80px] border border-dashed border-border/50 rounded flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[420px] sm:max-w-[420px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingItem ? 'Редактировать запись' : 'Новая запись'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 mt-6">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Название или тема</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="О чём будет этот контент?" />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Дата публикации</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDate ? format(formDate, 'dd.MM.yyyy') : 'Выберите дату'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formDate} onSelect={setFormDate} initialFocus className={cn('p-3 pointer-events-auto')} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Content type */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Тип контента</Label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CONTENT_TYPES.map(t => {
                  const cfg = CONTENT_TYPE_CONFIG[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setFormType(t)}
                      className={cn(
                        'text-xs px-2.5 py-1.5 rounded-full border transition-colors',
                        formType === t
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {(() => { const TypeIcon = cfg.Icon; return <TypeIcon className="w-3 h-3 inline mr-1" />; })()} {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platforms */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Платформы</Label>
              <div className="space-y-2">
                {ALL_PLATFORMS.map(p => {
                  const cfg = PLATFORM_CONFIG[p];
                  return (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={formPlatforms.includes(p)} onCheckedChange={() => togglePlatform(p)} />
                      <span className="text-sm">{cfg.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Статус</Label>
              <div className="flex gap-2">
                {ALL_STATUSES.filter(s => s !== 'published').map(s => (
                  <button
                    key={s}
                    onClick={() => setFormStatus(s)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors',
                      formStatus === s
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dotClass}`} />
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Заметки</Label>
              <Textarea rows={3} value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Заметки или ключевые тезисы" />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setSheetOpen(false)}>Отмена</Button>
              <Button variant="outline" onClick={() => { handleSave(); /* navigate to post editor */ }} className="text-xs">
                Создать черновик поста →
              </Button>
              <Button onClick={handleSave}>Сохранить</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ContentPlan;
