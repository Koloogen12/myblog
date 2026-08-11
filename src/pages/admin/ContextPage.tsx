import { useState } from 'react';
import { Brain, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useContextEntries, useCreateContextEntry, useUpdateContextEntry, type ContextEntry } from '@/hooks/useContextEntries';
import { CATEGORY_CONFIG, PRODUCT_COLORS } from '@/lib/context-data';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const truncate = (text: string, lines: number) => {
  const arr = text.split('\n').filter(Boolean);
  const sliced = arr.slice(0, lines);
  return sliced.join('\n') + (arr.length > lines ? '...' : '');
};

const getStatusLine = (content: string) => {
  const line = content.split('\n').find(l => l.trim().toLowerCase().startsWith('статус'));
  return line?.trim() ?? null;
};

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'd MMMM', { locale: ru }); } catch { return ''; }
};

const ContextPage = () => {
  const { data: entries = [], isLoading } = useContextEntries();
  const createEntry = useCreateContextEntry();
  const updateEntry = useUpdateContextEntry();

  const [editEntry, setEditEntry] = useState<ContextEntry | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // form state
  const [formCategory, setFormCategory] = useState<ContextEntry['category']>('bio');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formActive, setFormActive] = useState(true);

  const activeCount = entries.filter(e => e.is_active).length;
  const inactiveCount = entries.length - activeCount;

  const bioEntry = entries.find(e => e.category === 'bio');
  const goalEntry = entries.find(e => e.category === 'goal');
  const products = entries.filter(e => e.category === 'product');
  const trends = entries.filter(e => e.category === 'trend' || e.category === 'event');

  const openEdit = (entry: ContextEntry) => {
    setEditEntry(entry);
    setIsNew(false);
    setFormCategory(entry.category);
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setFormActive(entry.is_active);
    setSheetOpen(true);
  };

  const openNew = (cat?: ContextEntry['category']) => {
    setEditEntry(null);
    setIsNew(true);
    setFormCategory(cat ?? 'bio');
    setFormTitle('');
    setFormContent('');
    setFormActive(true);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isNew) {
        await createEntry.mutateAsync({
          category: formCategory,
          title: formTitle,
          content: formContent,
          is_active: formActive,
        });
      } else if (editEntry) {
        await updateEntry.mutateAsync({
          id: editEntry.id,
          category: formCategory,
          title: formTitle,
          content: formContent,
          is_active: formActive,
        });
      }
      setSheetOpen(false);
      toast.success('Контекст обновлён', { description: 'AI будет использовать новую версию.' });
    } catch {
      toast.error('Ошибка при сохранении');
    }
  };

  const toggleActive = async (entry: ContextEntry) => {
    try {
      await updateEntry.mutateAsync({ id: entry.id, is_active: !entry.is_active });
    } catch {
      toast.error('Ошибка при обновлении');
    }
  };

  const renderBaseCard = (entry: ContextEntry | undefined, lines = 3) => {
    if (!entry) return null;
    const cfg = CATEGORY_CONFIG[entry.category];
    return (
      <Card className={`relative transition-opacity ${!entry.is_active ? 'opacity-50 border-muted' : ''}`}>
        <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center gap-2">
            <cfg.Icon className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>
          </div>
          <Switch checked={entry.is_active} onCheckedChange={() => toggleActive(entry)} className="scale-90" />
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">{truncate(entry.content, lines)}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Обновлено {formatDate(entry.updated_at)}</span>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => openEdit(entry)}>Редактировать</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5" /> Контекст AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Эти данные использует AI-агент при генерации контента. Обновляйте раз в неделю.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => openNew()}>
          <Plus className="w-4 h-4 mr-1" /> Добавить запись
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-2">
        <Badge variant="secondary" className="text-xs font-normal">{entries.length} записей всего</Badge>
        <Badge variant="secondary" className="text-xs font-normal text-emerald-500">{activeCount} активных</Badge>
        <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">{inactiveCount} неактивная</Badge>
      </div>

      {/* Section 1: Base context */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Базовый контекст</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderBaseCard(bioEntry)}
          {renderBaseCard(goalEntry)}
        </div>
      </section>

      {/* Section 2: Products */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Продукты</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p, i) => {
            const statusLine = getStatusLine(p.content);
            const color = PRODUCT_COLORS[i % PRODUCT_COLORS.length];
            return (
              <Card
                key={p.id}
                className={`relative transition-opacity ${!p.is_active ? 'opacity-50 border-muted' : ''}`}
                style={{ borderLeftWidth: 3, borderLeftColor: color }}
              >
                <CardHeader className="pb-1 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground">{p.title}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                      <span className="text-xs text-muted-foreground">{p.is_active ? 'Активен' : 'Неактивен'}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0 space-y-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">{truncate(p.content, 2)}</p>
                  {statusLine && (
                    <p className="text-xs text-muted-foreground/80 italic line-clamp-1">{statusLine}</p>
                  )}
                  <Button variant="ghost" size="sm" className="text-xs h-6 px-0" onClick={() => openEdit(p)}>Редактировать</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Section 3: Trends & Events */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Тренды и события</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trends.map(t => renderBaseCard(t, 4))}
        </div>
      </section>

      {/* Edit/Add Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isNew ? 'Новая запись' : `Редактировать: ${editEntry?.title}`}</SheetTitle>
            <SheetDescription>Пишите в свободной форме. AI понимает структуру и ключевые факты.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={formCategory} onValueChange={(v) => setFormCategory(v as ContextEntry['category'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}><span className="flex items-center gap-1.5">{(() => { const CIcon = cfg.Icon; return <CIcon className="w-3.5 h-3.5 inline" />; })()} {cfg.label}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Название</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Название записи" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formActive} onCheckedChange={setFormActive} />
              <Label className="text-sm">Включить в AI-контекст</Label>
            </div>
            <div className="space-y-2">
              <Label>Содержание</Label>
              <Textarea
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                rows={14}
                className="font-mono text-sm"
                placeholder="Пишите в свободной форме..."
              />
              <p className="text-xs text-muted-foreground">Пишите в свободной форме. AI понимает структуру и ключевые факты.</p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setSheetOpen(false)}>Отмена</Button>
              <Button onClick={handleSave} disabled={createEntry.isPending || updateEntry.isPending}>
                {(createEntry.isPending || updateEntry.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Сохранить
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ContextPage;
