import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, LayoutGrid, List, MoreHorizontal, Sparkles, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  STATUS_CONFIG, CONTENT_TYPE_CONFIG, PLATFORM_CONFIG,
  type ContentStatus, type ContentType, type Platform,
} from '@/lib/content-studio-data';
import { useContentItems, useCreateContentItem, useUpdateContentItem, useDeleteContentItem, type ContentItem } from '@/hooks/useContentStudio';
import { useProjects } from '@/hooks/useProjects';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const COLUMNS: ContentStatus[] = ['idea', 'writing', 'ready', 'queued', 'published'];

const PlatformPill = ({ platform }: { platform: string }) => {
  const cfg = PLATFORM_CONFIG[platform as Platform];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded ${cfg.color}`}>
      {cfg.shortLabel}
    </span>
  );
};

const ContentCard = ({
  item,
  onOpen,
  onDelete,
  onDragStart,
}: {
  item: ContentItem;
  onOpen: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, item: ContentItem) => void;
}) => {
  const typeCfg = CONTENT_TYPE_CONFIG[item.content_type as ContentType];
  if (!typeCfg) return null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onClick={onOpen}
      className="group bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all hover:border-primary/30 active:opacity-80 active:scale-[0.98]"
    >
      <div className="flex items-start gap-2 mb-2">
        <typeCfg.Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium text-foreground line-clamp-2 flex-1">{item.title}</span>
        {item.ai_generated && (
          <Sparkles className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {(item.platforms || []).map((p) => (
            <PlatformPill key={p} platform={p} />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {item.scheduled_at && (
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(item.scheduled_at), 'd MMM', { locale: ru })}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-opacity">
                <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(); }}>Открыть</DropdownMenuItem>
              <DropdownMenuItem>Дублировать</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>Удалить</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

const ContentStudio = () => {
  const navigate = useNavigate();
  const { data: items = [], isLoading } = useContentItems();
  const { data: allProjects = [] } = useProjects();
  const createContentItem = useCreateContentItem();
  const updateContentItem = useUpdateContentItem();
  const deleteContentItem = useDeleteContentItem();

  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [publishedExpanded, setPublishedExpanded] = useState(false);

  // Quick-add form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ContentType>('post');
  const [newPlatforms, setNewPlatforms] = useState<Platform[]>(['site', 'telegram']);
  const [newNotes, setNewNotes] = useState('');
  const [newProjectId, setNewProjectId] = useState<string>('');

  const dragItem = useRef<ContentItem | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ContentStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, item: ContentItem) => {
    dragItem.current = item;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: ContentStatus) => {
    e.preventDefault();
    setDragOverCol(status);
  };

  const handleDrop = (status: ContentStatus) => {
    if (dragItem.current && dragItem.current.status !== status) {
      updateContentItem.mutate(
        { id: dragItem.current.id, status },
        {
          onSuccess: () => {
            if (status === 'writing') {
              toast('Хотите сгенерировать черновик?', {
                description: 'AI может написать текст на основе темы',
                action: {
                  label: 'Да →',
                  onClick: () => navigate(`/admin/content-studio/${dragItem.current!.id}`),
                },
              });
            }
          },
          onError: () => toast.error('Ошибка при обновлении статуса'),
        }
      );
    }
    dragItem.current = null;
    setDragOverCol(null);
  };

  const handleQuickAdd = async (openEditor: boolean) => {
    if (!newTitle.trim()) return;
    try {
      const created = await createContentItem.mutateAsync({
        title: newTitle,
        status: 'idea',
        content_type: newType,
        platforms: newPlatforms,
        master_text: '',
        platform_versions: {},
        scheduled_at: null,
        published_at: null,
        slug: null,
        tags: [],
        notes: newNotes,
        ai_generated: false,
        project_id: newProjectId || null,
      });
      setSheetOpen(false);
      setNewTitle('');
      setNewNotes('');
      setNewProjectId('');
      toast.success('Контент добавлен');
      if (openEditor) navigate(`/admin/content-studio/${created.id}`);
    } catch {
      toast.error('Ошибка при создании');
    }
  };

  const handleDelete = (id: string) => {
    deleteContentItem.mutate(id, {
      onSuccess: () => toast.success('Контент удалён'),
      onError: () => toast.error('Ошибка при удалении'),
    });
  };

  const togglePlatform = (p: Platform) => {
    setNewPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const stats = {
    idea: items.filter((i) => i.status === 'idea').length,
    writing: items.filter((i) => i.status === 'writing').length,
    ready: items.filter((i) => i.status === 'ready').length,
    queued: items.filter((i) => i.status === 'queued').length,
    published: items.filter((i) => i.status === 'published').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-semibold text-foreground">Content Studio</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${view === 'kanban' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Канбан
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${view === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-3.5 h-3.5" /> Список
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.success('Контент-план сгенерирован', { description: 'AI предложил 4 темы на неделю на основе контекста' });
            }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Сгенерировать план
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/content-studio/schedule')}
          >
            <Calendar className="w-3.5 h-3.5 mr-1" /> Очередь
          </Button>
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Новый контент
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-xs">
        {(Object.entries(STATUS_CONFIG) as [ContentStatus, typeof STATUS_CONFIG.idea][]).map(([key, cfg]) => (
          <span key={key} className={`flex items-center gap-1 ${cfg.color}`}>
            <cfg.Icon className="w-3 h-3" /> {stats[key]} {cfg.label.toLowerCase()}
          </span>
        ))}
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
          {COLUMNS.map((status) => {
            const colItems = items.filter((i) => i.status === status);
            const isPublished = status === 'published';
            const cfg = STATUS_CONFIG[status];

            return (
              <div
                key={status}
                className={`flex-shrink-0 w-[260px] rounded-lg transition-colors ${dragOverCol === status ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(status)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-1.5">
                    <cfg.Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{colItems.length}</Badge>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {isPublished && !publishedExpanded ? (
                    <button
                      onClick={() => setPublishedExpanded(true)}
                      className="w-full text-xs text-muted-foreground border border-dashed border-border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                    >
                      {colItems.length} публикаций • Показать ▼
                    </button>
                  ) : (
                    <>
                      {colItems.map((item) => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          onOpen={() => navigate(`/admin/content-studio/${item.id}`)}
                          onDelete={() => handleDelete(item.id)}
                          onDragStart={handleDragStart}
                        />
                      ))}
                      {isPublished && publishedExpanded && (
                        <button
                          onClick={() => setPublishedExpanded(false)}
                          className="w-full text-[10px] text-muted-foreground py-1"
                        >
                          Свернуть ▲
                        </button>
                      )}
                    </>
                  )}
                  {colItems.length === 0 && !isPublished && (
                    <button
                      onClick={() => setSheetOpen(true)}
                      className="w-full border border-dashed border-border rounded-lg p-4 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
                    >
                      + Добавить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Тема</TableHead>
                <TableHead className="text-xs w-20">Тип</TableHead>
                <TableHead className="text-xs w-32">Платформы</TableHead>
                <TableHead className="text-xs w-28">Статус</TableHead>
                <TableHead className="text-xs w-24">Дата</TableHead>
                <TableHead className="text-xs w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((item) => {
                const typeCfg = CONTENT_TYPE_CONFIG[item.content_type as ContentType];
                const statusCfg = STATUS_CONFIG[item.status as ContentStatus];
                if (!typeCfg || !statusCfg) return null;
                return (
                  <TableRow key={item.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/admin/content-studio/${item.id}`)}>
                    <TableCell className="text-sm font-medium">
                      <typeCfg.Icon className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                      {item.title}
                      {item.ai_generated && <Sparkles className="w-3 h-3 text-primary inline ml-1.5" />}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{typeCfg.label}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">{(item.platforms || []).map((p) => <PlatformPill key={p} platform={p} />)}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs flex items-center gap-1 ${statusCfg.color}`}><statusCfg.Icon className="w-3 h-3" /> {statusCfg.label}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(item.created_at), 'd MMM', { locale: ru })}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-xs h-7">Открыть</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Quick-Add Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent style={{ maxWidth: 380 }} className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Новый контент</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 mt-4">
            <div>
              <Input
                autoFocus
                placeholder="О чём пост?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Тип контента</label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(CONTENT_TYPE_CONFIG) as [ContentType, typeof CONTENT_TYPE_CONFIG.post][]).filter(([k]) => k !== 'link').map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setNewType(key)}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors flex items-center gap-1 ${newType === key ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    <cfg.Icon className="w-3 h-3" /> {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Платформы</label>
              <div className="space-y-2">
                {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG.site][]).map(([key, cfg]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={newPlatforms.includes(key)}
                      onCheckedChange={() => togglePlatform(key)}
                    />
                    <span className="flex items-center gap-1.5"><cfg.Icon className="w-3.5 h-3.5" /> {cfg.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Проект (необязательно)</label>
              <Select value={newProjectId} onValueChange={setNewProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="К какому проекту относится?" />
                </SelectTrigger>
                <SelectContent>
                  {allProjects.filter(p => p.status !== 'archive').map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">AI будет знать контекст проекта при генерации</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Тезисы (необязательно)</label>
              <Textarea
                rows={3}
                placeholder="Ключевые мысли через Enter..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => handleQuickAdd(false)} disabled={createContentItem.isPending}>
                Добавить как идею
              </Button>
              <Button className="flex-1" onClick={() => handleQuickAdd(true)} disabled={createContentItem.isPending}>
                {createContentItem.isPending && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                Открыть редактор →
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ContentStudio;
