import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Loader2, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useProfileSettings, useUpdateProfileSettings, type ProfileSettings } from '@/hooks/useProfileSettings';
import { uploadImage } from '@/lib/storage';

const SettingsProfile = () => {
  const { data: profile, isLoading } = useProfileSettings();
  const updateProfile = useUpdateProfileSettings();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [signature, setSignature] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate from DB
  useEffect(() => {
    if (profile && !initialized) {
      setName(profile.name || '');
      setTagline(profile.tagline || '');
      setBio(profile.bio || '');
      setSignature(profile.signature || '');
      setAvatarUrl(profile.avatarUrl || '');
      setLinks(profile.links?.length ? profile.links : [
        { title: 'От идеи до MVP', url: 'https://charm-penalty-bb9.notion.site/MVP-13e947c1f44280f8a699f785cc89cd15' },
        { title: 'Бесплатная консультация', url: 'https://qlick.io/ru/widget/kochnev/free-consult/start' },
      ]);
      setSocials(Object.keys(profile.socials || {}).length ? profile.socials : {
        telegram_channel: '@kochnev_blog',
        linkedin: 'https://linkedin.com/in/kochnefff',
        instagram: 'https://instagram.com/kochnefff',
        telegram: 'https://t.me/kochnefff',
        vcru: 'https://vc.ru/u/618305-danil-kochnev',
        email: 'ceo@themono.ru',
      });
      setInitialized(true);
    }
  }, [profile, initialized]);

  const socialLabels: Record<string, string> = {
    telegram_channel: 'Telegram Channel',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    telegram: 'Telegram (личный)',
    vcru: 'VC.ru',
    email: 'Email',
  };

  const addLink = () => {
    if (links.length >= 3) return;
    setLinks([...links, { title: '', url: '' }]);
  };

  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i));

  const updateLink = (i: number, field: 'title' | 'url', value: string) => {
    const updated = [...links];
    updated[i][field] = value;
    setLinks(updated);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setAvatarUrl(url);
      toast({ title: 'Фото загружено' });
    } catch {
      toast({ title: 'Ошибка загрузки фото', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const data: ProfileSettings = {
      name,
      tagline,
      bio,
      signature,
      avatarUrl,
      links,
      socials,
    };
    try {
      await updateProfile.mutateAsync(data);
      toast({ title: 'Профиль сохранён' });
    } catch {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Личные данные */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Личные данные</h2>
          <Separator className="mt-2" />
        </div>

        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <div
            className="relative w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 cursor-pointer group overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Аватар" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="text-sm">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline font-medium"
              disabled={isUploading}
            >
              {avatarUrl ? 'Заменить фото' : 'Загрузить фото'}
            </button>
            <p className="text-xs text-muted-foreground mt-0.5">Рекомендуемый размер: 400×400px</p>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="text-xs text-destructive hover:underline mt-1"
              >
                Удалить фото
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Имя</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Должность / tagline</Label>
            <Input value={tagline} onChange={e => setTagline(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Биография</Label>
          <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Подпись</Label>
          <Input value={signature} onChange={e => setSignature(e.target.value)} className="max-w-sm" />
        </div>
      </section>

      {/* Ссылки в шапке */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Ссылки в шапке</h2>
          <Separator className="mt-2" />
        </div>

        {links.map((link, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Название</Label>
              <Input value={link.title} onChange={e => updateLink(i, 'title', e.target.value)} />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">URL</Label>
              <Input value={link.url} onChange={e => updateLink(i, 'url', e.target.value)} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeLink(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {links.length < 3 && (
          <Button variant="outline" size="sm" onClick={addLink} className="gap-1">
            <Plus className="w-3 h-3" /> Добавить ссылку
          </Button>
        )}
        <p className="text-xs text-muted-foreground">Отображаются как кнопки в навигации сайта</p>
      </section>

      {/* Соцсети */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Соцсети</h2>
          <Separator className="mt-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(socials).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{socialLabels[key] || key}</Label>
              <Input
                value={value}
                type={key === 'email' ? 'email' : 'text'}
                onChange={e => setSocials(prev => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Только для отображения на сайте. Для автопостинга — вкладка «Платформы».</p>
      </section>

      {/* Footer */}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};

export default SettingsProfile;
