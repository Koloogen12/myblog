import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  useAboutContent,
  useUpdateAboutContent,
  DEFAULT_ABOUT,
  type AboutContent,
  type StatItem,
  type TimelineItem,
} from '@/hooks/useSiteContent';
import { RichTextField } from '@/components/admin/RichTextField';

const SettingsAbout = () => {
  const { data, isLoading } = useAboutContent();
  const update = useUpdateAboutContent();

  const [form, setForm] = useState<AboutContent>(DEFAULT_ABOUT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (data && !ready) {
      setForm(data);
      setReady(true);
    }
  }, [data, ready]);

  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Stats
  const updateStat = (i: number, field: keyof StatItem, value: string) => {
    const arr = [...form.stats];
    arr[i] = { ...arr[i], [field]: value };
    set('stats', arr);
  };
  const addStat = () => set('stats', [...form.stats, { value: '', label: '' }]);
  const removeStat = (i: number) =>
    set(
      'stats',
      form.stats.filter((_, idx) => idx !== i),
    );

  // Timeline
  const updateTL = (i: number, field: keyof TimelineItem, value: string) => {
    const arr = [...form.timeline];
    arr[i] = { ...arr[i], [field]: value };
    set('timeline', arr);
  };
  const addTL = () =>
    set('timeline', [
      ...form.timeline,
      { age: '', year: '', title: '', description: '', url: '' },
    ]);
  const removeTL = (i: number) =>
    set(
      'timeline',
      form.timeline.filter((_, idx) => idx !== i),
    );
  const moveTL = (i: number, dir: -1 | 1) => {
    const arr = [...form.timeline];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set('timeline', arr);
  };

  const handleSave = async () => {
    try {
      await update.mutateAsync(form);
      toast({ title: 'Страница «Обо мне» сохранена' });
    } catch {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main bio */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Основной блок</h2>
          <Separator className="mt-2" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Заголовок</Label>
          <Input value={form.heading} onChange={e => set('heading', e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Главный bio</Label>
          <RichTextField
            value={form.mainBio}
            onChange={v => set('mainBio', v)}
            placeholder="Расскажи о себе…"
            minHeight={260}
          />
          <p className="text-xs text-muted-foreground">
            Поддерживается форматирование: заголовки, жирность, курсив, списки, цитаты,
            ссылки, картинки, разделители.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Вторичный bio (короткий)</Label>
          <RichTextField
            value={form.secondaryBio}
            onChange={v => set('secondaryBio', v)}
            placeholder="Короткое описание для сайдбара…"
            minHeight={100}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Описание блога</Label>
          <RichTextField
            value={form.blogDescription}
            onChange={v => set('blogDescription', v)}
            placeholder="О чём этот блог…"
            minHeight={100}
          />
        </div>
      </section>

      {/* Stats */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Цифры</h2>
          <Separator className="mt-2" />
        </div>

        {form.stats.map((s, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="w-24 space-y-1">
              <Label className="text-xs">Значение</Label>
              <Input value={s.value} onChange={e => updateStat(i, 'value', e.target.value)} />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Подпись</Label>
              <Input value={s.label} onChange={e => updateStat(i, 'label', e.target.value)} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeStat(i)}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addStat} className="gap-1">
          <Plus className="w-3 h-3" /> Добавить цифру
        </Button>
      </section>

      {/* Timeline */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Таймлайн «Путь»</h2>
          <Separator className="mt-2" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Заголовок секции</Label>
          <Input
            value={form.timelineHeading}
            onChange={e => set('timelineHeading', e.target.value)}
          />
        </div>

        {form.timeline.map((t, i) => (
          <div
            key={i}
            className="border border-border rounded-lg p-4 space-y-3 bg-secondary/20"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">
                #{i + 1}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveTL(i, -1)}
                  disabled={i === 0}
                  className="h-7 w-7"
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveTL(i, 1)}
                  disabled={i === form.timeline.length - 1}
                  className="h-7 w-7"
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTL(i)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Возраст</Label>
                <Input
                  value={t.age}
                  onChange={e => updateTL(i, 'age', e.target.value)}
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Год</Label>
                <Input
                  value={t.year}
                  onChange={e => updateTL(i, 'year', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Заголовок</Label>
              <Input value={t.title} onChange={e => updateTL(i, 'title', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Описание</Label>
              <Textarea
                value={t.description}
                onChange={e => updateTL(i, 'description', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">URL (необязательно)</Label>
              <Input
                value={t.url || ''}
                onChange={e => updateTL(i, 'url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addTL} className="gap-1">
          <Plus className="w-3 h-3" /> Добавить событие
        </Button>
      </section>

      {/* CTA */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">CTA в конце страницы</h2>
          <Separator className="mt-2" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Заголовок</Label>
          <Input value={form.ctaHeading} onChange={e => set('ctaHeading', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Текст</Label>
          <Textarea
            value={form.ctaText}
            onChange={e => set('ctaText', e.target.value)}
            rows={2}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Текст кнопки</Label>
            <Input
              value={form.ctaButtonText}
              onChange={e => set('ctaButtonText', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ссылка кнопки</Label>
            <Input
              value={form.ctaButtonLink}
              onChange={e => set('ctaButtonLink', e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={update.isPending}>
          {update.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};

export default SettingsAbout;
