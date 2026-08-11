import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Send, Briefcase, Twitter, AtSign, AlertTriangle, type LucideIcon } from 'lucide-react';

interface Platform {
  id: string;
  Icon: LucideIcon;
  name: string;
  connected: boolean;
  type: 'token' | 'oauth';
  lastUsed?: string;
  note?: string;
  warning?: string;
  fields?: { key: string; label: string; value: string; secret?: boolean }[];
}

const initialPlatforms: Platform[] = [
  {
    id: 'telegram',
    Icon: Send,
    name: 'Telegram',
    connected: true,
    type: 'token',
    lastUsed: '5 марта 2026',
    fields: [
      { key: 'bot_token', label: 'Bot Token', value: 'sk-1234567890abcdef', secret: true },
      { key: 'channel_id', label: 'Channel ID', value: '@kochnev_blog' },
    ],
  },
  {
    id: 'linkedin',
    Icon: Briefcase,
    name: 'LinkedIn',
    connected: false,
    type: 'oauth',
    note: 'Поддерживает текстовые посты и PDF-карусели',
  },
  {
    id: 'twitter',
    Icon: Twitter,
    name: 'X / Twitter',
    connected: false,
    type: 'token',
    warning: 'Twitter API Basic — от $100/мес. Рекомендуем публиковать вручную для старта.',
    fields: [
      { key: 'api_key', label: 'API Key', value: '' },
      { key: 'api_secret', label: 'API Secret', value: '', secret: true },
      { key: 'access_token', label: 'Access Token', value: '', secret: true },
    ],
  },
  {
    id: 'threads',
    Icon: AtSign,
    name: 'Threads',
    connected: false,
    type: 'oauth',
    note: 'Бесплатно, лимит 250 постов/сутки',
  },
];

const SettingsPlatforms = () => {
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (key: string) => {
    setVisibleSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const StatusDot = ({ connected }: { connected: boolean }) => (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
      <span className={connected ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
        {connected ? 'Подключено' : 'Не подключено'}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-800 dark:text-blue-300">
        Эти настройки нужны для публикации контента из Content Studio.
        Они не влияют на отображение соцсетей на сайте.
      </div>

      {platforms.map(platform => (
        <Card key={platform.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <platform.Icon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">{platform.name}</span>
              </div>
              <StatusDot connected={platform.connected} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {platform.type === 'oauth' && !platform.connected && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Авторизация через {platform.id === 'threads' ? 'Meta OAuth' : 'OAuth 2.0'}
                </p>
                <Button variant="outline" size="sm">
                  Подключить {platform.name} →
                </Button>
              </div>
            )}

            {platform.fields && (
              <div className="space-y-2">
                {platform.fields.map(field => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs">{field.label}</Label>
                    <div className="flex gap-1">
                      <Input
                        type={field.secret && !visibleSecrets[`${platform.id}-${field.key}`] ? 'password' : 'text'}
                        value={field.value}
                        onChange={() => {}}
                        placeholder={field.label}
                      />
                      {field.secret && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => toggleSecret(`${platform.id}-${field.key}`)}
                        >
                          {visibleSecrets[`${platform.id}-${field.key}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {platform.warning && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" /> {platform.warning}
              </p>
            )}

            {platform.note && (
              <p className="text-xs text-muted-foreground">{platform.note}</p>
            )}

            {platform.connected && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Последнее использование: {platform.lastUsed}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast({ title: 'Соединение работает' })}>
                    Тест соединения
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Отключить
                  </Button>
                </div>
              </div>
            )}

            {!platform.connected && platform.type === 'token' && platform.fields && (
              <Button variant="outline" size="sm" onClick={() => toast({ title: 'Сохранено' })}>
                Сохранить и проверить
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SettingsPlatforms;
