import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  useHomeContent,
  useUpdateHomeContent,
  DEFAULT_HOME,
  type HomeContent,
} from '@/hooks/useSiteContent';

const SettingsHomepage = () => {
  const { data, isLoading } = useHomeContent();
  const update = useUpdateHomeContent();

  const [form, setForm] = useState<HomeContent>(DEFAULT_HOME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (data && !ready) {
      setForm(data);
      setReady(true);
    }
  }, [data, ready]);

  const set = <K extends keyof HomeContent>(key: K, value: HomeContent[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await update.mutateAsync(form);
      toast({ title: 'Главная страница сохранена' });
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
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Hero-блок</h2>
          <Separator className="mt-2" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Надзаголовок (бейдж над H1)</Label>
          <Input
            value={form.heroKicker}
            onChange={e => set('heroKicker', e.target.value)}
            placeholder="Например: Блог Данила Кочнева"
          />
          <p className="text-xs text-muted-foreground">
            Маленькая оранжевая надпись над заголовком hero. Оставь пустым, чтобы скрыть.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Заголовок (H1)</Label>
          <Textarea
            value={form.heroTitle}
            onChange={e => set('heroTitle', e.target.value)}
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Перевод строки через Enter — отобразится как разрыв строки
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Подзаголовок</Label>
          <Textarea
            value={form.heroSubtitle}
            onChange={e => set('heroSubtitle', e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Текст кнопки</Label>
            <Input
              value={form.heroCtaText}
              onChange={e => set('heroCtaText', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ссылка кнопки</Label>
            <Input
              value={form.heroCtaLink}
              onChange={e => set('heroCtaLink', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Короткая bio в сайдбаре</h2>
          <Separator className="mt-2" />
        </div>

        <Textarea
          value={form.sidebarBio}
          onChange={e => set('sidebarBio', e.target.value)}
          rows={3}
        />
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

export default SettingsHomepage;
