import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  useProjectsContent,
  useUpdateProjectsContent,
  DEFAULT_PROJECTS,
  type ProjectsContent,
  type ProjectItem,
} from '@/hooks/useSiteContent';
import { ImageField } from '@/components/admin/ImageField';

const STATUS_OPTIONS = [
  { value: 'active', label: 'В активной разработке' },
  { value: 'growth', label: 'Растёт' },
  { value: 'launched', label: 'Запущен' },
  { value: 'archive', label: 'Архив' },
];

const SettingsProjects = () => {
  const { data, isLoading } = useProjectsContent();
  const update = useUpdateProjectsContent();

  const [form, setForm] = useState<ProjectsContent>(DEFAULT_PROJECTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (data && !ready) {
      setForm(data);
      setReady(true);
    }
  }, [data, ready]);

  const set = <K extends keyof ProjectsContent>(
    key: K,
    value: ProjectsContent[K],
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const updateProject = <K extends keyof ProjectItem>(
    i: number,
    field: K,
    value: ProjectItem[K],
  ) => {
    const arr = [...form.projects];
    const next = { ...arr[i], [field]: value };
    // Auto-sync statusLabel when status changes
    if (field === 'status') {
      const opt = STATUS_OPTIONS.find(o => o.value === value);
      if (opt) next.statusLabel = opt.label;
    }
    arr[i] = next;
    set('projects', arr);
  };

  const addProject = () =>
    set('projects', [
      ...form.projects,
      {
        id: `project-${Date.now()}`,
        name: 'Новый проект',
        emoji: '✨',
        year: String(new Date().getFullYear()),
        tagline: '',
        description: '',
        status: 'active',
        statusLabel: 'В активной разработке',
        tags: [],
        metrics: '',
        url: '',
      },
    ]);
  const removeProject = (i: number) =>
    set(
      'projects',
      form.projects.filter((_, idx) => idx !== i),
    );
  const moveProject = (i: number, dir: -1 | 1) => {
    const arr = [...form.projects];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set('projects', arr);
  };

  const handleSave = async () => {
    try {
      await update.mutateAsync(form);
      toast({ title: 'Проекты сохранены' });
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
      {/* Header block */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Шапка страницы</h2>
          <Separator className="mt-2" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Заголовок</Label>
          <Input value={form.heading} onChange={e => set('heading', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Описание</Label>
          <Textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Заголовок секции «активные»</Label>
            <Input
              value={form.activeHeading}
              onChange={e => set('activeHeading', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Заголовок секции «архив»</Label>
            <Input
              value={form.archiveHeading}
              onChange={e => set('archiveHeading', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Projects list */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Проекты ({form.projects.length})</h2>
        </div>
        <Separator />

        {form.projects.map((p, i) => (
          <div
            key={i}
            className="border border-border rounded-lg p-4 space-y-3 bg-secondary/20"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">
                #{i + 1} · {p.name || 'Без названия'}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveProject(i, -1)}
                  disabled={i === 0}
                  className="h-7 w-7"
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveProject(i, 1)}
                  disabled={i === form.projects.length - 1}
                  className="h-7 w-7"
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProject(i)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Emoji</Label>
                <Input
                  value={p.emoji}
                  onChange={e => updateProject(i, 'emoji', e.target.value)}
                  disabled={!!p.iconImage}
                  placeholder={p.iconImage ? 'используется картинка' : '✨'}
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Название</Label>
                <Input
                  value={p.name}
                  onChange={e => updateProject(i, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Год</Label>
                <Input
                  value={p.year}
                  onChange={e => updateProject(i, 'year', e.target.value)}
                />
              </div>
            </div>

            {/* Custom icon image (overrides emoji when set) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <ImageField
                  label="Иконка-картинка (заменяет emoji)"
                  value={p.iconImage}
                  onChange={v => updateProject(i, 'iconImage', v)}
                  placeholder="URL или загрузить с компьютера →"
                />
              </div>
              {p.iconImage && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Тип кадрирования</Label>
                    <select
                      value={p.iconFit || 'cover'}
                      onChange={e =>
                        updateProject(
                          i,
                          'iconFit',
                          e.target.value as 'cover' | 'contain',
                        )
                      }
                      className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                    >
                      <option value="cover">Заполнить (фото)</option>
                      <option value="contain">Вписать (логотип)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Фон (для логотипа)</Label>
                    <Input
                      type="color"
                      value={p.iconBg || '#ffffff'}
                      onChange={e => updateProject(i, 'iconBg', e.target.value)}
                      className="h-9 p-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Краткое описание (tagline)</Label>
              <Input
                value={p.tagline}
                onChange={e => updateProject(i, 'tagline', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Полное описание</Label>
              <Textarea
                value={p.description}
                onChange={e => updateProject(i, 'description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Статус</Label>
                <select
                  value={p.status}
                  onChange={e => updateProject(i, 'status', e.target.value)}
                  className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                >
                  {STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Подпись статуса</Label>
                <Input
                  value={p.statusLabel}
                  onChange={e => updateProject(i, 'statusLabel', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Теги (через запятую)</Label>
              <Input
                value={p.tags.join(', ')}
                onChange={e =>
                  updateProject(
                    i,
                    'tags',
                    e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                  )
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Метрика (например «$100K pre-seed»)</Label>
                <Input
                  value={p.metrics || ''}
                  onChange={e => updateProject(i, 'metrics', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL проекта</Label>
                <Input
                  value={p.url || ''}
                  onChange={e => updateProject(i, 'url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addProject} className="gap-1">
          <Plus className="w-3 h-3" /> Добавить проект
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
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Кнопка 1 — текст</Label>
            <Input
              value={form.ctaPrimaryText}
              onChange={e => set('ctaPrimaryText', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Кнопка 1 — ссылка</Label>
            <Input
              value={form.ctaPrimaryLink}
              onChange={e => set('ctaPrimaryLink', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Кнопка 2 — текст</Label>
            <Input
              value={form.ctaSecondaryText}
              onChange={e => set('ctaSecondaryText', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Кнопка 2 — ссылка</Label>
            <Input
              value={form.ctaSecondaryLink}
              onChange={e => set('ctaSecondaryLink', e.target.value)}
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

export default SettingsProjects;
