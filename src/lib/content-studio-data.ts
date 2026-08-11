import {
  Lightbulb, Pencil, CheckCircle2, CalendarDays, Sparkles,
  FileText, Activity, GalleryHorizontalEnd, Video, Link2,
  Globe, Send, Briefcase, Twitter, AtSign,
  type LucideIcon,
} from 'lucide-react';

export type Platform = 'site' | 'telegram' | 'linkedin' | 'twitter' | 'threads';

export type ContentStatus = 'idea' | 'writing' | 'ready' | 'queued' | 'published';
export type ContentType = 'post' | 'sprint' | 'carousel' | 'video' | 'link';

export interface ContentItem {
  id: string;
  title: string;
  status: ContentStatus;
  content_type: ContentType;
  platforms: Platform[];
  master_text: string;
  platform_versions: {
    telegram?: string;
    linkedin?: string;
    twitter?: string;
    threads?: string;
  };
  scheduled_at?: string;
  published_at?: string;
  slug?: string;
  tags?: string[];
  notes?: string;
  ai_generated: boolean;
  created_at: string;
  project_id?: string;
}

export const STATUS_CONFIG: Record<ContentStatus, { label: string; Icon: LucideIcon; color: string }> = {
  idea: { label: 'Идея', Icon: Lightbulb, color: 'text-muted-foreground' },
  writing: { label: 'Пишу', Icon: Pencil, color: 'text-blue-400' },
  ready: { label: 'Готово', Icon: CheckCircle2, color: 'text-emerald-400' },
  queued: { label: 'В очереди', Icon: CalendarDays, color: 'text-orange-400' },
  published: { label: 'Опубликовано', Icon: Sparkles, color: 'text-muted-foreground' },
};

export const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string; Icon: LucideIcon }> = {
  post: { label: 'Пост', Icon: FileText },
  sprint: { label: 'Спринт', Icon: Activity },
  carousel: { label: 'Карусель', Icon: GalleryHorizontalEnd },
  video: { label: 'Видео', Icon: Video },
  link: { label: 'Ссылка', Icon: Link2 },
};

export const PLATFORM_CONFIG: Record<Platform, { label: string; shortLabel: string; Icon: LucideIcon; color: string; borderColor: string; maxChars: number }> = {
  site: { label: 'Сайт', shortLabel: 'Сайт', Icon: Globe, color: 'bg-muted/60 text-foreground', borderColor: 'border-l-muted-foreground', maxChars: 0 },
  telegram: { label: 'Telegram', shortLabel: 'TG', Icon: Send, color: 'bg-blue-500/10 text-blue-400', borderColor: 'border-l-blue-500', maxChars: 4096 },
  linkedin: { label: 'LinkedIn', shortLabel: 'LI', Icon: Briefcase, color: 'bg-indigo-500/10 text-indigo-400', borderColor: 'border-l-indigo-500', maxChars: 3000 },
  twitter: { label: 'X / Twitter', shortLabel: 'X', Icon: Twitter, color: 'bg-slate-500/10 text-slate-400', borderColor: 'border-l-slate-400', maxChars: 280 },
  threads: { label: 'Threads', shortLabel: 'Threads', Icon: AtSign, color: 'bg-purple-500/10 text-purple-400', borderColor: 'border-l-purple-500', maxChars: 500 },
};

export const MOCK_CONTENT: ContentItem[] = [
  {
    id: '1',
    title: 'Почему я начал вести блог публично',
    status: 'published',
    content_type: 'post',
    platforms: ['site', 'telegram', 'linkedin'],
    master_text: 'Три года назад я выпустил THE MONO — маркетплейс для локальных fashion-брендов. За эти три года я прошёл путь от «сейчас всё получится» до «кажется, я делаю всё неправильно» и обратно.\n\nМне всегда нравилась идея transparency report — когда фаундеры открыто пишут о том, как строят бизнес. Buffer, Baremetrics, Basecamp — все они в какой-то момент начали делиться цифрами и решениями публично.\n\nНо я понял, что transparency report — это не только про цифры. Это про мышление. Про то, как принимаются решения. Про ошибки, которые видны только изнутри.',
    platform_versions: {
      telegram: '**Почему я начал вести блог публично**\n\nТри года назад я выпустил THE MONO — маркетплейс для fashion-брендов.\n\nЗа это время прошёл путь от «сейчас всё получится» до полного пересмотра подхода.\n\nМне нравилась идея transparency reports. Но понял — дело не только в цифрах. Дело в мышлении и ошибках, которые видны только изнутри.',
      linkedin: 'Три года назад я запустил THE MONO — маркетплейс для локальных fashion-брендов.\n\nЗа эти годы я научился больше из ошибок, чем из успехов. И в какой-то момент понял: лучший способ учиться — писать публично.\n\nTransparency reports от Buffer и Basecamp вдохновили, но я хочу пойти дальше: делиться не только цифрами, но и процессом принятия решений.',
    },
    published_at: '2026-03-05T10:00:00Z',
    slug: 'pochemu-ya-nachal-vesti-blog-publichno',
    ai_generated: true,
    created_at: '2026-03-04T20:00:00Z',
  },
  {
    id: '2',
    title: 'Итоги переговоров с ЦУМом',
    status: 'writing',
    content_type: 'post',
    platforms: ['site', 'telegram'],
    master_text: 'Встреча с ЦУМом прошла неожиданно. Я готовился к формальной презентации, а получил живой разговор о проблемах fashion e-commerce.',
    platform_versions: {},
    notes: '- провели встречу\n- они заинтересованы но медленно\n- нужен follow-up',
    ai_generated: false,
    created_at: '2026-03-10T12:00:00Z',
  },
  {
    id: '3',
    title: '5 ошибок в юнит-экономике',
    status: 'ready',
    content_type: 'carousel',
    platforms: ['linkedin'],
    master_text: 'Если вы строите B2B продукт и не считаете юнит-экономику — вы летите вслепую.\n\nВот 5 ошибок, которые я видел (и делал сам):\n\n1. Считать LTV по всем клиентам вместе\n2. Игнорировать churn в первые 3 месяца\n3. Не учитывать cost of sales\n4. Забывать про onboarding costs\n5. Оптимизировать CPA когда проблема в retention',
    platform_versions: {
      linkedin: '5 ошибок в юнит-экономике, которые я видел (и делал сам):\n\n1️⃣ Считать LTV по всем клиентам — а не по когортам\n2️⃣ Игнорировать ранний churn\n3️⃣ Забывать cost of sales\n4️⃣ Не считать onboarding costs\n5️⃣ Оптимизировать CPA при плохом retention\n\nКакие ещё ошибки видели?',
    },
    ai_generated: true,
    created_at: '2026-03-08T18:00:00Z',
  },
  {
    id: '4',
    title: 'CarSwap: почему 0 из 8 конвертировали',
    status: 'idea',
    content_type: 'post',
    platforms: ['site', 'telegram'],
    master_text: '',
    platform_versions: {},
    notes: '',
    ai_generated: false,
    created_at: '2026-03-11T09:00:00Z',
  },
  {
    id: '5',
    title: 'MakeMeLook Спринт #9',
    status: 'queued',
    content_type: 'sprint',
    platforms: ['site', 'telegram'],
    master_text: 'Девятая неделя с момента запуска MakeMeLook. На этой неделе фокус был на переговорах с ЦУМом и расширении pipeline.\n\nГлавное:\n• 3 активных переговора, ни одного закрытого\n• Понял: нужно 20+ параллельных переговоров\n• Подготовили коммерческое для ФИТ',
    platform_versions: {
      telegram: '**MakeMeLook: Спринт #9**\n\nГлавное за неделю:\n• 3 переговора — 0 закрытых\n• Нужно 20+ переговоров параллельно\n• Готовим КП для ФИТ',
    },
    scheduled_at: '2026-03-15T10:00:00Z',
    ai_generated: true,
    created_at: '2026-03-11T19:00:00Z',
  },
];

export const AI_MOCK_DRAFT = `Пять недель назад я отправил коммерческое предложение в ЦУМ.

Четыре недели назад они сказали «интересно, пришлите детали».

Три недели назад я отправил детали.

Две недели назад — тишина.

Неделю назад я написал follow-up. «Мы изучаем».

Сегодня я понял кое-что важное про корпоративные продажи: enterprise-цикл — это не про качество продукта. Это про терпение и количество попыток.

Что я делаю иначе с этой недели:

- 20+ одновременных переговоров, а не 3
- Follow-up каждые 5 дней, не каждые 2 недели
- Перестаю ждать — начинаю двигаться параллельно`;

export const AI_MOCK_HOOK = `Я отправил предложение в ЦУМ 5 недель назад. Они так и не ответили.

Вот что я понял про B2B-продажи крупным ритейлерам:`;

export const AI_MOCK_SHORT = `Enterprise-цикл — не про качество продукта. Про терпение.

5 недель переговоров с ЦУМом. 0 ответов. Вот что я меняю:

- 20+ переговоров параллельно
- Follow-up каждые 5 дней
- Не жду — двигаюсь`;
