import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  X,
  Loader2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  useLinkhubContent,
  useUpdateLinkhubContent,
  DEFAULT_LINKHUB,
  SOCIAL_PLATFORMS,
  type LinkhubContent,
  type LinkhubSection,
  type LinkhubTile,
  type LinkhubSocial,
  type SocialPlatform,
} from '@/hooks/useSiteContent';
import { ImageField } from '@/components/admin/ImageField';

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  telegram: 'Telegram (личный)',
  telegram_channel: 'Telegram-канал',
  linkedin: 'LinkedIn',
  twitter: 'Twitter / X',
  vc: 'VC.ru',
  github: 'GitHub',
  email: 'Email',
  website: 'Website',
  custom: 'Другое',
};

const VARIANT_LABELS: Record<NonNullable<LinkhubTile['variant']>, string> = {
  featured: 'Большая карточка (иконка + текст + "Перейти")',
  compact: 'Компактная строка',
  logo: 'Квадрат-логотип (группа в ряд)',
  default: 'Обычная',
};

const newId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const newTile = (variant: LinkhubTile['variant'] = 'featured'): LinkhubTile => ({
  id: newId(),
  emoji: '✨',
  title: 'Новая плитка',
  description: '',
  url: '',
  visible: true,
  variant,
});

const newSection = (): LinkhubSection => ({
  id: newId(),
  heading: '',
  tiles: [newTile()],
  visible: true,
});

// ===== MAIN PAGE =====

const SettingsLinkhub = () => {
  const { data, isLoading } = useLinkhubContent();
  const update = useUpdateLinkhubContent();

  const [form, setForm] = useState<LinkhubContent>(DEFAULT_LINKHUB);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (data && !ready) {
      setForm(data);
      setReady(true);
    }
  }, [data, ready]);

  const set = <K extends keyof LinkhubContent>(key: K, value: LinkhubContent[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // ---- Sections ----
  const updateSection = <K extends keyof LinkhubSection>(
    si: number,
    field: K,
    value: LinkhubSection[K],
  ) => {
    const arr = [...form.sections];
    arr[si] = { ...arr[si], [field]: value };
    set('sections', arr);
  };

  const addSection = () => set('sections', [...form.sections, newSection()]);
  const removeSection = (si: number) =>
    set('sections', form.sections.filter((_, i) => i !== si));
  const moveSection = (si: number, dir: -1 | 1) => {
    const arr = [...form.sections];
    const j = si + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[si], arr[j]] = [arr[j], arr[si]];
    set('sections', arr);
  };

  // ---- Tiles ----
  const updateTile = <K extends keyof LinkhubTile>(
    si: number,
    ti: number,
    field: K,
    value: LinkhubTile[K],
  ) => {
    const arr = [...form.sections];
    const tiles = [...arr[si].tiles];
    tiles[ti] = { ...tiles[ti], [field]: value };
    arr[si] = { ...arr[si], tiles };
    set('sections', arr);
  };

  const addTile = (si: number) => {
    const arr = [...form.sections];
    arr[si] = { ...arr[si], tiles: [...arr[si].tiles, newTile()] };
    set('sections', arr);
  };

  const removeTile = (si: number, ti: number) => {
    const arr = [...form.sections];
    arr[si] = { ...arr[si], tiles: arr[si].tiles.filter((_, i) => i !== ti) };
    set('sections', arr);
  };

  const moveTile = (si: number, ti: number, dir: -1 | 1) => {
    const arr = [...form.sections];
    const tiles = [...arr[si].tiles];
    const j = ti + dir;
    if (j < 0 || j >= tiles.length) return;
    [tiles[ti], tiles[j]] = [tiles[j], tiles[ti]];
    arr[si] = { ...arr[si], tiles };
    set('sections', arr);
  };

  // ---- Socials ----
  const updateSocial = <K extends keyof LinkhubSocial>(
    i: number,
    field: K,
    value: LinkhubSocial[K],
  ) => {
    const arr = [...form.socials];
    arr[i] = { ...arr[i], [field]: value };
    set('socials', arr);
  };

  const addSocial = () =>
    set('socials', [
      ...form.socials,
      { platform: 'custom', url: '', visible: true, customLabel: '' },
    ]);
  const removeSocial = (i: number) =>
    set('socials', form.socials.filter((_, idx) => idx !== i));
  const moveSocial = (i: number, dir: -1 | 1) => {
    const arr = [...form.socials];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set('socials', arr);
  };

  // ---- Footer links ----
  const updateFooterLink = (i: number, field: 'label' | 'url', value: string) => {
    const arr = [...form.footerLinks];
    arr[i] = { ...arr[i], [field]: value };
    set('footerLinks', arr);
  };
  const addFooterLink = () =>
    set('footerLinks', [...form.footerLinks, { label: '', url: '' }]);
  const removeFooterLink = (i: number) =>
    set('footerLinks', form.footerLinks.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    try {
      await update.mutateAsync(form);
      toast({ title: 'Линк-хаб сохранён' });
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
      {/* Hero */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Шапка (hero)</h2>
          <Separator className="mt-2" />
        </div>
        <ImageField
          label="Баннер над аватаром (необязательно)"
          value={form.heroImage}
          onChange={v => set('heroImage', v)}
        />
        <div className="space-y-1.5">
          <Label className="text-xs">Заголовок</Label>
          <Input value={form.heroTitle} onChange={e => set('heroTitle', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Подзаголовок</Label>
          <Input
            value={form.heroSubtitle}
            onChange={e => set('heroSubtitle', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.showAvatar}
            onCheckedChange={v => set('showAvatar', v)}
          />
          <Label className="text-xs cursor-pointer">
            Показывать аватар (берётся из «Профиль»)
          </Label>
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">
            Секции и плитки ({form.sections.length})
          </h2>
          <Separator className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Варианты плиток:
            <br />
            • <b>featured</b> — большая карточка (иконка + текст + «Перейти»). Для главных продуктов.
            <br />
            • <b>compact</b> — компактная строка. Для кнопок-ссылок.
            <br />
            • <b>logo</b> — квадрат с логотипом. Если все плитки в секции logo — они идут в ряд 3-в-строке.
          </p>
        </div>

        {form.sections.map((s, si) => (
          <div
            key={s.id}
            className={`border border-border rounded-xl p-4 space-y-4 ${
              !s.visible ? 'opacity-60 bg-muted/30' : 'bg-secondary/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="text-xs font-medium text-muted-foreground">
                Секция #{si + 1}
              </div>
              <div className="ml-auto flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateSection(si, 'visible', !s.visible)}
                  title={s.visible ? 'Скрыть секцию' : 'Показать секцию'}
                  className="h-7 w-7"
                >
                  {s.visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveSection(si, -1)}
                  disabled={si === 0}
                  className="h-7 w-7"
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveSection(si, 1)}
                  disabled={si === form.sections.length - 1}
                  className="h-7 w-7"
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(si)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Заголовок секции (пусто = без заголовка)
              </Label>
              <Input
                value={s.heading}
                onChange={e => updateSection(si, 'heading', e.target.value)}
                placeholder="Например: Мои компании"
              />
            </div>
            <div className="grid grid-cols-[1fr_1fr] gap-2">
              <div className="space-y-1">
                <Label className="text-xs">
                  Ссылка справа от заголовка — текст
                </Label>
                <Input
                  value={s.headingLinkLabel || ''}
                  onChange={e =>
                    updateSection(si, 'headingLinkLabel', e.target.value)
                  }
                  placeholder="Перейти в блог →"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ссылка справа от заголовка — URL</Label>
                <Input
                  value={s.headingLinkUrl || ''}
                  onChange={e =>
                    updateSection(si, 'headingLinkUrl', e.target.value)
                  }
                  placeholder="/blog"
                />
              </div>
            </div>

            <div className="space-y-3 pl-2 border-l-2 border-primary/30">
              {s.tiles.map((t, ti) => (
                <div
                  key={t.id}
                  className={`border border-border rounded-lg p-3 space-y-2 bg-background ${
                    !t.visible ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] text-muted-foreground">
                      Плитка #{ti + 1}
                    </div>
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateTile(si, ti, 'visible', !t.visible)}
                        title={t.visible ? 'Скрыть' : 'Показать'}
                        className="h-6 w-6"
                      >
                        {t.visible ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveTile(si, ti, -1)}
                        disabled={ti === 0}
                        className="h-6 w-6"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveTile(si, ti, 1)}
                        disabled={ti === s.tiles.length - 1}
                        className="h-6 w-6"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTile(si, ti)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Вариант плитки</Label>
                    <select
                      value={t.variant || 'featured'}
                      onChange={e =>
                        updateTile(si, ti, 'variant', e.target.value as LinkhubTile['variant'])
                      }
                      className="w-full h-9 px-2 text-sm rounded-md border border-input bg-background"
                    >
                      {(Object.keys(VARIANT_LABELS) as Array<keyof typeof VARIANT_LABELS>).map(v => (
                        <option key={v} value={v}>
                          {VARIANT_LABELS[v]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ImageField
                    label="Картинка иконки (необязательно, перебивает emoji)"
                    value={t.iconImage}
                    onChange={v => updateTile(si, ti, 'iconImage', v)}
                  />

                  {t.iconImage && (
                    <div className="grid grid-cols-[1fr_110px] gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Как вписывать картинку</Label>
                        <select
                          value={t.iconFit || 'cover'}
                          onChange={e =>
                            updateTile(si, ti, 'iconFit', e.target.value as 'cover' | 'contain')
                          }
                          className="w-full h-9 px-2 text-sm rounded-md border border-input bg-background"
                        >
                          <option value="cover">Заполнить с обрезкой (для фото)</option>
                          <option value="contain">Целиком без обрезки (для логотипов)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Фон (hex)</Label>
                        <Input
                          value={t.iconBg || ''}
                          onChange={e => updateTile(si, ti, 'iconBg', e.target.value)}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-[70px_1fr] gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Emoji</Label>
                      <Input
                        value={t.emoji}
                        onChange={e => updateTile(si, ti, 'emoji', e.target.value)}
                        className="text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Заголовок</Label>
                      <Input
                        value={t.title}
                        onChange={e => updateTile(si, ti, 'title', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Описание (необязательно)</Label>
                    <Textarea
                      value={t.description}
                      onChange={e => updateTile(si, ti, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-[1fr_180px] gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Ссылка</Label>
                      <Input
                        value={t.url}
                        onChange={e => updateTile(si, ti, 'url', e.target.value)}
                        placeholder="https://... или /blog"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Текст кнопки</Label>
                      <Input
                        value={t.buttonText || ''}
                        onChange={e => updateTile(si, ti, 'buttonText', e.target.value)}
                        placeholder="Перейти / Забрать / ..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => addTile(si)}
                className="gap-1"
              >
                <Plus className="w-3 h-3" /> Добавить плитку
              </Button>
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addSection} className="gap-1">
          <Plus className="w-3 h-3" /> Добавить секцию
        </Button>
      </section>

      {/* Socials */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Соцсети (иконки под hero)</h2>
          <Separator className="mt-2" />
        </div>

        {form.socials.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 ${!s.visible ? 'opacity-50' : ''}`}
          >
            <select
              value={s.platform}
              onChange={e =>
                updateSocial(i, 'platform', e.target.value as SocialPlatform)
              }
              className="h-9 px-2 text-sm rounded-md border border-input bg-background w-40"
            >
              {SOCIAL_PLATFORMS.map(p => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
            {s.platform === 'custom' && (
              <Input
                value={s.customLabel || ''}
                onChange={e => updateSocial(i, 'customLabel', e.target.value)}
                placeholder="Название"
                className="w-32"
              />
            )}
            <Input
              value={s.url}
              onChange={e => updateSocial(i, 'url', e.target.value)}
              placeholder="URL"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateSocial(i, 'visible', !s.visible)}
              className="h-9 w-9"
            >
              {s.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveSocial(i, -1)}
              disabled={i === 0}
              className="h-9 w-9"
            >
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => moveSocial(i, 1)}
              disabled={i === form.socials.length - 1}
              className="h-9 w-9"
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeSocial(i)}
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addSocial} className="gap-1">
          <Plus className="w-3 h-3" /> Добавить соцсеть
        </Button>
      </section>

      {/* Footer */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Футер</h2>
          <Separator className="mt-2" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Копирайт-текст</Label>
          <Input
            value={form.footerText}
            onChange={e => set('footerText', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Ссылки в футере</Label>
          {form.footerLinks.map((l, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={l.label}
                onChange={e => updateFooterLink(i, 'label', e.target.value)}
                placeholder="Название"
                className="w-1/3"
              />
              <Input
                value={l.url}
                onChange={e => updateFooterLink(i, 'url', e.target.value)}
                placeholder="URL"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFooterLink(i)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addFooterLink} className="gap-1">
            <Plus className="w-3 h-3" /> Добавить ссылку
          </Button>
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

export default SettingsLinkhub;
