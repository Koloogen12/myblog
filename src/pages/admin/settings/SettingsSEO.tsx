import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSEOSettings, useUpdateSEOSettings } from '@/hooks/useSiteSettings';
import { uploadImage } from '@/lib/storage';

const SettingsSEO = () => {
  const { data: seo, isLoading } = useSEOSettings();
  const updateSEO = useUpdateSEOSettings();

  const [siteName, setSiteName] = useState('');
  const [titleTemplate, setTitleTemplate] = useState('');
  const [description, setDescription] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [gaId, setGaId] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (seo) {
      setSiteName(seo.siteName);
      setTitleTemplate(seo.titleTemplate);
      setDescription(seo.description);
      setOgTitle(seo.ogTitle);
      setOgImageUrl(seo.ogImageUrl);
      setGaId(seo.gaId);
    }
  }, [seo]);

  const handleOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setOgImageUrl(url);
      toast({ title: 'OG изображение загружено' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      toast({ title: 'Ошибка загрузки', description: msg, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateSEO.mutateAsync({
        siteName,
        titleTemplate,
        description,
        ogTitle,
        ogImageUrl,
        gaId,
      });
      toast({ title: 'SEO настройки сохранены' });
    } catch {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Основное */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Основное</h2>
          <Separator className="mt-2" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Название сайта</Label>
          <Input value={siteName} onChange={e => setSiteName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Шаблон title страниц</Label>
          <Input value={titleTemplate} onChange={e => setTitleTemplate(e.target.value)} />
          <p className="text-xs text-muted-foreground">Используйте {'{заголовок}'} для подстановки названия страницы</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Описание по умолчанию</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
      </section>

      {/* Open Graph */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Open Graph</h2>
          <p className="text-xs text-muted-foreground mt-1">Для превью при шаринге в соцсетях</p>
          <Separator className="mt-2" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">OG Image по умолчанию</Label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleOgUpload} />
          {ogImageUrl ? (
            <div className="relative">
              <img src={ogImageUrl} alt="OG" className="w-full aspect-[1200/630] object-cover rounded-lg border border-border" />
              <button
                type="button"
                onClick={() => { setOgImageUrl(''); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm">Загрузка...</span>
                </>
              ) : (
                <>
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-sm">Загрузить изображение</span>
                  <span className="text-xs">Рекомендуемый размер: 1200×630px</span>
                </>
              )}
            </button>
          )}
          {/* Preview card */}
          <div className="mt-3 rounded-lg border border-border overflow-hidden bg-card">
            {ogImageUrl ? (
              <img src={ogImageUrl} alt="" className="w-full h-32 object-cover" />
            ) : (
              <div className="w-full h-32 bg-muted flex items-center justify-center text-muted-foreground text-xs">
                Превью OG-изображения
              </div>
            )}
            <div className="p-3">
              <p className="text-xs text-muted-foreground uppercase">kochnev.blog</p>
              <p className="text-sm font-medium mt-0.5">{ogTitle}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">OG Title</Label>
          <Input value={ogTitle} onChange={e => setOgTitle(e.target.value)} />
        </div>
      </section>

      {/* Analytics */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Аналитика</h2>
          <Separator className="mt-2" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Google Analytics ID</Label>
          <Input value={gaId} onChange={e => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" className="max-w-xs" />
          <p className="text-xs text-muted-foreground">Вставьте Measurement ID из Google Analytics 4</p>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={updateSEO.isPending}>
          {updateSEO.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Сохранение...</>
          ) : (
            'Сохранить SEO настройки'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsSEO;
