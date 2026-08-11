import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, X } from 'lucide-react';
import type { FaqItem } from '@/types';

/** Everything the SEO panel owns, kept as one object so PostEditor can pass
 *  it straight through to the save payload. */
export interface SeoFields {
  seo_title: string;
  seo_description: string;
  focus_keyword: string;
  keywords: string[];
  tldr: string;
  faq: FaqItem[];
}

interface SeoPanelProps {
  value: SeoFields;
  onChange: (next: SeoFields) => void;
  /** Fallbacks shown in the SERP preview when SEO fields are empty. */
  fallbackTitle: string;
  fallbackDescription: string;
  slug: string;
}

// Google truncates around these lengths; past them the tail is simply lost.
const TITLE_LIMIT = 60;
const DESC_LIMIT = 160;
// A quotable summary is short enough to lift whole into an AI answer.
const TLDR_MIN_WORDS = 40;
const TLDR_MAX_WORDS = 60;

const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** Length counter that turns amber past the limit instead of blocking input —
 *  going over is sometimes a deliberate call, it just needs to be visible. */
const Counter = ({ current, limit }: { current: number; limit: number }) => (
  <span
    className={`text-[11px] tabular-nums ${
      current > limit ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'
    }`}
  >
    {current}/{limit}
  </span>
);

const SeoPanel = ({
  value,
  onChange,
  fallbackTitle,
  fallbackDescription,
  slug,
}: SeoPanelProps) => {
  const set = <K extends keyof SeoFields>(key: K, v: SeoFields[K]) =>
    onChange({ ...value, [key]: v });

  const previewTitle = value.seo_title || fallbackTitle || 'Заголовок статьи';
  const previewDesc =
    value.seo_description || value.tldr || fallbackDescription || 'Описание появится здесь…';
  const tldrWords = countWords(value.tldr);

  const updateFaq = (i: number, field: keyof FaqItem, v: string) => {
    const next = [...value.faq];
    next[i] = { ...next[i], [field]: v };
    set('faq', next);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">SEO и AI-выдача</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Пустые поля берутся из заголовка и описания статьи
        </p>
      </div>

      {/* Live SERP preview — the fastest way to see what actually gets shown. */}
      <div className="rounded-lg border border-border bg-secondary/20 p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Так увидят в Google
        </p>
        <p className="text-[13px] text-[#1a0dab] dark:text-[#8ab4f8] leading-snug line-clamp-1">
          {previewTitle.length > TITLE_LIMIT
            ? previewTitle.slice(0, TITLE_LIMIT) + '…'
            : previewTitle}
        </p>
        <p className="text-[11px] text-[#006621] dark:text-[#3c9f4a] mt-0.5">
          dkochnev.com › post › {slug || 'slug'}
        </p>
        <p className="text-[12px] text-muted-foreground leading-snug mt-1 line-clamp-2">
          {previewDesc.length > DESC_LIMIT ? previewDesc.slice(0, DESC_LIMIT) + '…' : previewDesc}
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">SEO-заголовок</Label>
          <Counter current={value.seo_title.length} limit={TITLE_LIMIT} />
        </div>
        <Input
          value={value.seo_title}
          onChange={e => set('seo_title', e.target.value)}
          placeholder={fallbackTitle || 'Заголовок для поиска'}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">SEO-описание</Label>
          <Counter current={value.seo_description.length} limit={DESC_LIMIT} />
        </div>
        <Textarea
          value={value.seo_description}
          onChange={e => set('seo_description', e.target.value)}
          rows={3}
          placeholder={fallbackDescription || 'Описание для сниппета в выдаче'}
        />
      </div>

      <Separator />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Коротко (TL;DR)</Label>
          <span
            className={`text-[11px] tabular-nums ${
              tldrWords && (tldrWords < TLDR_MIN_WORDS || tldrWords > TLDR_MAX_WORDS)
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground'
            }`}
          >
            {tldrWords} слов
          </span>
        </div>
        <Textarea
          value={value.tldr}
          onChange={e => set('tldr', e.target.value)}
          rows={4}
          placeholder="Законченный ответ на 40–60 слов. Показывается над статьёй и попадает в ответы нейросетей."
        />
        <p className="text-[11px] text-muted-foreground">
          Именно этот блок нейросети цитируют чаще всего — он должен быть понятен
          без остального текста.
        </p>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Label className="text-xs">Главный запрос</Label>
        <Input
          value={value.focus_keyword}
          onChange={e => set('focus_keyword', e.target.value)}
          placeholder="как найти product-market fit"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Ключевые слова (через запятую)</Label>
        <Input
          value={value.keywords.join(', ')}
          onChange={e =>
            set(
              'keywords',
              e.target.value
                .split(',')
                .map(k => k.trim())
                .filter(Boolean),
            )
          }
          placeholder="product-market fit, кастдев, стартап"
        />
        <p className="text-[11px] text-muted-foreground">
          Для карты тем, а не для вставки в текст: переспам снижает видимость в AI-выдаче.
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Частые вопросы</Label>
          <span className="text-[11px] text-muted-foreground">{value.faq.length}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Вопрос-ответ в разметке FAQPage — нейросети берут такие пары готовыми.
        </p>

        {value.faq.map((item, i) => (
          <div key={i} className="rounded-lg border border-border p-2.5 space-y-2 bg-secondary/20">
            <div className="flex items-start gap-2">
              <Input
                value={item.question}
                onChange={e => updateFaq(i, 'question', e.target.value)}
                placeholder="Вопрос"
                className="h-8 text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => set('faq', value.faq.filter((_, idx) => idx !== i))}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Textarea
              value={item.answer}
              onChange={e => updateFaq(i, 'answer', e.target.value)}
              placeholder="Ответ в 2–3 предложения"
              rows={2}
              className="text-xs"
            />
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => set('faq', [...value.faq, { question: '', answer: '' }])}
          className="gap-1 w-full"
        >
          <Plus className="w-3 h-3" /> Добавить вопрос
        </Button>
      </div>
    </div>
  );
};

export default SeoPanel;
