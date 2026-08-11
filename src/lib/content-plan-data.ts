import {
  MessageCircle, ClipboardList, Compass, BookOpen, Activity,
  Video, Film, GalleryHorizontalEnd,
  type LucideIcon,
} from 'lucide-react';

export type ContentType = 'thoughts' | 'meta' | 'principles' | 'books' | 'sprint' | 'video' | 'reel' | 'carousel';
export type ContentPlatform = 'site' | 'telegram' | 'instagram' | 'linkedin' | 'twitter';
export type ContentStatus = 'idea' | 'draft' | 'scheduled' | 'published';

export interface ContentPlanItem {
  id: string;
  title: string;
  planned_date: string;
  content_type: ContentType;
  platforms: ContentPlatform[];
  status: ContentStatus;
  post_slug?: string;
  notes?: string;
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string; Icon: LucideIcon }> = {
  thoughts: { label: 'Мысли', Icon: MessageCircle },
  meta: { label: 'Мета', Icon: ClipboardList },
  principles: { label: 'Принципы', Icon: Compass },
  books: { label: 'Книга', Icon: BookOpen },
  sprint: { label: 'Спринт', Icon: Activity },
  video: { label: 'Видео', Icon: Video },
  reel: { label: 'Рилс', Icon: Film },
  carousel: { label: 'Карусель', Icon: GalleryHorizontalEnd },
};

export const PLATFORM_CONFIG: Record<ContentPlatform, { label: string; shortLabel: string; className: string }> = {
  site: { label: 'Сайт', shortLabel: 'Сайт', className: 'bg-muted-foreground/10 text-muted-foreground' },
  telegram: { label: 'Telegram', shortLabel: 'TG', className: 'bg-blue-500/10 text-blue-500' },
  instagram: { label: 'Instagram', shortLabel: 'IG', className: 'bg-orange-500/10 text-orange-500' },
  linkedin: { label: 'LinkedIn', shortLabel: 'LI', className: 'bg-indigo-500/10 text-indigo-500' },
  twitter: { label: 'X/Twitter', shortLabel: 'X', className: 'bg-sky-500/10 text-sky-500' },
};

export const STATUS_CONFIG: Record<ContentStatus, { label: string; dotClass: string; bgClass: string }> = {
  idea: { label: 'Идея', dotClass: 'bg-muted-foreground', bgClass: 'border-border' },
  draft: { label: 'Черновик', dotClass: 'bg-amber-500', bgClass: 'bg-amber-500/5' },
  scheduled: { label: 'Запланировано', dotClass: 'bg-blue-500', bgClass: 'bg-blue-500/5' },
  published: { label: 'Опубликовано', dotClass: 'bg-emerald-500', bgClass: 'bg-emerald-500/5' },
};

export const MOCK_CONTENT_PLAN: ContentPlanItem[] = [
  { id: '1', title: 'Итоги переговоров с ЦУМом', planned_date: '2026-03-11', content_type: 'thoughts', platforms: ['site', 'telegram'], status: 'draft' },
  { id: '2', title: 'CarSwap: 20 звонков детейлинг-центрам', planned_date: '2026-03-12', content_type: 'sprint', platforms: ['site', 'telegram', 'linkedin'], status: 'idea' },
  { id: '3', title: '5 ошибок в юнит-экономике', planned_date: '2026-03-14', content_type: 'carousel', platforms: ['linkedin'], status: 'idea' },
  { id: '4', title: 'MakeMeLook Спринт #8', planned_date: '2026-03-10', content_type: 'sprint', platforms: ['site', 'telegram'], status: 'scheduled' },
  { id: '5', title: 'Принцип радикальной прозрачности', planned_date: '2026-03-05', content_type: 'principles', platforms: ['site'], status: 'published', post_slug: 'printsip-radikalnoj-prozrachnosti' },
  { id: '6', title: 'Как я строю продукты', planned_date: '2026-03-01', content_type: 'thoughts', platforms: ['site', 'telegram'], status: 'published', post_slug: 'kak-ya-stroyu-produkty' },
  { id: '7', title: 'Почему я веду блог публично', planned_date: '2026-03-18', content_type: 'thoughts', platforms: ['site', 'telegram', 'instagram'], status: 'idea' },
  { id: '8', title: 'Как работает виртуальная примерка', planned_date: '2026-03-20', content_type: 'video', platforms: ['instagram', 'telegram'], status: 'idea' },
];

const DAY_NAMES_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function getDayShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES_SHORT[d.getDay()]} ${d.getDate()}`;
}

export function getWeekMonday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

export function getWeekDays(mondayStr: string): string[] {
  const days: string[] = [];
  const monday = new Date(mondayStr + 'T00:00:00');
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function formatWeekHeader(mondayStr: string): string {
  const monday = new Date(mondayStr + 'T00:00:00');
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()}–${sunday.getDate()} ${months[monday.getMonth()]}`;
  }
  return `${monday.getDate()} ${months[monday.getMonth()]} – ${sunday.getDate()} ${months[sunday.getMonth()]}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === '2026-03-07';
}
