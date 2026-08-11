import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

export interface CrossPostData {
  telegram: {
    enabled: boolean;
    text: string;
    parseMode: 'Markdown' | 'HTML';
    disablePreview: boolean;
  };
  threads: {
    enabled: boolean;
    text: string;
  };
  linkedin: {
    enabled: boolean;
    text: string;
    title: string;
  };
}

interface CrossPostSectionProps {
  data: CrossPostData;
  onChange: (data: CrossPostData) => void;
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
}

const LIMITS = {
  telegram: 4096,
  threads: 500,
  linkedin: 3000,
};

const charCount = (text: string, limit: number) => {
  const len = text.length;
  return (
    <span className={len > limit ? 'text-destructive font-medium' : 'text-muted-foreground'}>
      {len}/{limit}
    </span>
  );
};

const CrossPostSection = ({ data, onChange, postTitle, postExcerpt, postUrl }: CrossPostSectionProps) => {
  const update = <K extends keyof CrossPostData>(
    platform: K,
    field: keyof CrossPostData[K],
    value: CrossPostData[K][keyof CrossPostData[K]]
  ) => {
    onChange({
      ...data,
      [platform]: { ...data[platform], [field]: value },
    });
  };

  const enabledCount = [data.telegram.enabled, data.threads.enabled, data.linkedin.enabled].filter(Boolean).length;

  const platforms = [
    {
      key: 'telegram' as const,
      icon: '📨',
      name: 'Telegram',
      enabled: data.telegram.enabled,
      content: (
        <div className="space-y-3 pt-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Текст сообщения (Markdown)</Label>
              {charCount(data.telegram.text, LIMITS.telegram)}
            </div>
            <Textarea
              value={data.telegram.text}
              onChange={(e) => update('telegram', 'text', e.target.value)}
              rows={5}
              placeholder={`*${postTitle}*\n\n${postExcerpt}\n\n👉 Читать: ${postUrl}`}
              className="font-mono text-xs"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={data.telegram.disablePreview}
              onChange={(e) => update('telegram', 'disablePreview', e.target.checked)}
              className="accent-[hsl(var(--primary))]"
            />
            Отключить превью ссылок
          </label>
        </div>
      ),
    },
    {
      key: 'threads' as const,
      icon: '🧵',
      name: 'Threads',
      enabled: data.threads.enabled,
      content: (
        <div className="space-y-3 pt-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Текст поста (до 500 символов)</Label>
              {charCount(data.threads.text, LIMITS.threads)}
            </div>
            <Textarea
              value={data.threads.text}
              onChange={(e) => update('threads', 'text', e.target.value)}
              rows={4}
              placeholder={`${postTitle}\n\n${postExcerpt?.slice(0, 200)}\n\n${postUrl}`}
              className="text-sm"
            />
          </div>
        </div>
      ),
    },
    {
      key: 'linkedin' as const,
      icon: '💼',
      name: 'LinkedIn',
      enabled: data.linkedin.enabled,
      content: (
        <div className="space-y-3 pt-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Заголовок статьи</Label>
            <Input
              value={data.linkedin.title}
              onChange={(e) => update('linkedin', 'title', e.target.value)}
              placeholder={postTitle}
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Текст поста (до 3000 символов)</Label>
              {charCount(data.linkedin.text, LIMITS.linkedin)}
            </div>
            <Textarea
              value={data.linkedin.text}
              onChange={(e) => update('linkedin', 'text', e.target.value)}
              rows={4}
              placeholder={`${postTitle}\n\n${postExcerpt}\n\n🔗 ${postUrl}\n\n#blog #thoughts`}
              className="text-sm"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base">Кросс-постинг</Label>
        {enabledCount > 0 && (
          <Badge variant="secondary">{enabledCount} платформ{enabledCount === 1 ? 'а' : enabledCount < 5 ? 'ы' : ''}</Badge>
        )}
      </div>

      <div className="space-y-2">
        {platforms.map((p) => (
          <Collapsible key={p.key} open={p.enabled}>
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>{p.icon}</span>
                  {p.name}
                </div>
                <Switch
                  checked={p.enabled}
                  onCheckedChange={(v) => update(p.key, 'enabled', v)}
                />
              </div>
              <CollapsibleContent>{p.content}</CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default CrossPostSection;
