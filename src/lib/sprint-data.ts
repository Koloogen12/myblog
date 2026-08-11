export interface ProjectMetric {
  id: string;
  label: string;
  enabled: boolean;
  custom?: boolean;
}

export type ProjectStatus = 'active' | 'pause' | 'archive';

export interface Project {
  id: string;
  icon: string; // Lucide icon key from PROJECT_ICONS
  name: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  sprintCount: number;
  metrics: ProjectMetric[];
}

export interface SprintBullet {
  id: string;
  text: string;
}

export interface SprintSection {
  id: string;
  title: string;
  content: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  weekStart: string;
  weekEnd: string;
  status: 'draft' | 'published' | 'not_filled';
  metrics: Record<string, number>;
  intro: string;
  showIntro: boolean;
  bullets: SprintBullet[];
  sections: SprintSection[];
  createdAt: string;
}

// Default metrics
export const DEFAULT_METRICS: ProjectMetric[] = [
  { id: 'revenue_period', label: 'Выручка за период', enabled: true },
  { id: 'revenue_total', label: 'Выручка накопленным итогом', enabled: true },
  { id: 'active_deals', label: 'Активных сделок', enabled: true },
  { id: 'mrr', label: 'MRR', enabled: false },
  { id: 'active_users', label: 'Активных пользователей', enabled: false },
  { id: 'nps', label: 'NPS', enabled: false },
  { id: 'new_clients', label: 'Новых клиентов', enabled: false },
];

export const ICON_PICKER_KEYS = [
  'sparkles', 'car', 'store', 'bot', 'book-open', 'wallet', 'target', 'rocket',
  'wrench', 'smartphone', 'globe', 'lightbulb', 'palette', 'bar-chart',
  'trophy', 'zap', 'flask', 'tent', 'building', 'sprout',
];

export const SECTION_TEMPLATES = [
  { title: 'Команда', placeholder: 'Обновления по команде. Кого наняли, кто ушёл, изменения в процессах, настроение.' },
  { title: 'Продукт и бизнес', placeholder: 'Что изменилось в продукте. Гипотезы, которые проверили. Метрики продукта. Ключевые решения.' },
  { title: 'Привлечение', placeholder: 'Что работает в маркетинге. Какие каналы тестируете. Что не работает.' },
  { title: 'Операционка', placeholder: 'Процессы, инфраструктура, операционные изменения.' },
  { title: 'Медиа', placeholder: 'Контент, публикации, посты, видео, подкасты.' },
  { title: 'Тренинги', placeholder: 'Обучение, курсы, развитие навыков команды.' },
  { title: 'Финансы', placeholder: 'Финансовые показатели, бюджеты, расходы.' },
];

export function getSectionPlaceholder(title: string): string {
  const template = SECTION_TEMPLATES.find(t => t.title === title);
  return template?.placeholder || 'Напишите что угодно в свободной форме.';
}

// Mock Projects
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1', icon: 'sparkles', name: 'MakeMeLook', slug: 'makemelook',
    description: 'AI виртуальная примерка для fashion e-commerce',
    status: 'active', sprintCount: 3,
    metrics: DEFAULT_METRICS.map(m => ({ ...m })),
  },
  {
    id: 'proj-2', icon: 'car', name: 'CarSwap AI', slug: 'carswap-ai',
    description: 'AI перекраска авто для детейлинг-центров',
    status: 'active', sprintCount: 2,
    metrics: DEFAULT_METRICS.map(m => ({ ...m })),
  },
  {
    id: 'proj-3', icon: 'store', name: 'THE MONO', slug: 'the-mono',
    description: 'B2B маркетплейс для локальных fashion-брендов',
    status: 'pause', sprintCount: 1,
    metrics: DEFAULT_METRICS.map(m => ({ ...m })),
  },
  {
    id: 'proj-4', icon: 'bot', name: 'Cursor for Founders', slug: 'cursor-for-founders',
    description: 'AI workspace для фаундеров на основе JTBD',
    status: 'active', sprintCount: 0,
    metrics: DEFAULT_METRICS.map(m => ({ ...m })),
  },
  {
    id: 'proj-5', icon: 'book-open', name: 'Блог', slug: 'blog',
    description: 'Личный блог и контент-стратегия',
    status: 'active', sprintCount: 1,
    metrics: DEFAULT_METRICS.map(m => ({ ...m })),
  },
];

let uid = 100;
export const genId = () => `id-${++uid}`;

// Mock Sprints
export const MOCK_SPRINTS: Sprint[] = [
  {
    id: 'sprint-1',
    projectId: 'proj-1',
    weekStart: '2026-03-03',
    weekEnd: '2026-03-09',
    status: 'published',
    metrics: { revenue_period: 0, revenue_total: 0, active_deals: 3 },
    intro: 'Третья неделя с того момента, как я начал вести этот блог публично. Честно говоря, не ожидал, что настолько изменится отношение к работе когда знаешь, что напишешь об этом в конце недели.',
    showIntro: true,
    bullets: [
      { id: 'b1', text: '3 активных переговора: ЦУМ, ФИТ, Stefano Ricci — пока ни одного закрытого' },
      { id: 'b2', text: 'ЦУМ затянул ответ на 2 недели — отправляем follow-up в понедельник' },
      { id: 'b3', text: 'ФИТ от Рокетбанка: провели демо, очень заинтересованы, готовим коммерческое' },
      { id: 'b4', text: 'Stefano Ricci хотят iOS + виртуальную примерку, но отвечают раз в 10 дней' },
      { id: 'b5', text: 'Понял: нужно параллельно идти к 20+ потенциальным клиентам, а не 3' },
    ],
    sections: [
      {
        id: 's1', title: 'Переговоры',
        content: 'С ЦУМом застряли. Они просили коммерческое предложение две недели назад — я отправил на следующий день. Теперь тишина. Классический enterprise-цикл: быстрый интерес → медленное согласование. На следующей неделе пишу напрямую тому человеку, с кем встречался, а не в общий email.\n\nФИТ — другая история. Звонок был живой, они реально понимают проблему. Попросили цифры по конверсии — готовлю кейс.',
      },
      {
        id: 's2', title: 'Что понял',
        content: 'Главное осознание недели: я слишком мало делаю попыток. 3 переговора — это катастрофически мало. Hormozi говорит про 100 нет до первого да. У меня 3 разговора за месяц.\n\nНа следующей неделе: составить список 50 fashion e-commerce магазинов с оборотом от 50М и начать холодный outreach.',
      },
    ],
    createdAt: '2026-03-09T12:00:00Z',
  },
  {
    id: 'sprint-2',
    projectId: 'proj-2',
    weekStart: '2026-03-03',
    weekEnd: '2026-03-09',
    status: 'draft',
    metrics: { revenue_period: 0, revenue_total: 0, active_deals: 8 },
    intro: '',
    showIntro: true,
    bullets: [
      { id: 'b6', text: '8 детейлинг-центров попросили тест. Конверсия пока 0%' },
      { id: 'b7', text: 'Запускаем onboarding flow на следующей неделе' },
    ],
    sections: [
      { id: 's3', title: 'Продукт и бизнес', content: '8 детейлинг-центров попросили тест. Готовим онбординг. Конверсия из теста в оплату пока 0%.' },
      { id: 's4', title: 'Привлечение', content: 'Запустили лендинг. Холодные рассылки дают 12% open rate.' },
    ],
    createdAt: '2026-03-08T10:00:00Z',
  },
  {
    id: 'sprint-3',
    projectId: 'proj-1',
    weekStart: '2026-02-24',
    weekEnd: '2026-03-02',
    status: 'published',
    metrics: { revenue_period: 0, revenue_total: 0, active_deals: 2 },
    intro: '',
    showIntro: false,
    bullets: [
      { id: 'b8', text: 'Закрыли первую интеграцию с Lamoda' },
      { id: 'b9', text: '2 активных переговора' },
    ],
    sections: [],
    createdAt: '2026-03-02T12:00:00Z',
  },
  {
    id: 'sprint-4',
    projectId: 'proj-2',
    weekStart: '2026-02-24',
    weekEnd: '2026-03-02',
    status: 'published',
    metrics: { revenue_period: 0, revenue_total: 0, active_deals: 5 },
    intro: '',
    showIntro: false,
    bullets: [
      { id: 'b10', text: 'Запустили лендинг, 12 заявок за 3 дня' },
    ],
    sections: [],
    createdAt: '2026-03-02T10:00:00Z',
  },
  {
    id: 'sprint-5',
    projectId: 'proj-3',
    weekStart: '2026-02-24',
    weekEnd: '2026-03-02',
    status: 'published',
    metrics: { revenue_period: 0, revenue_total: 0, active_deals: 0 },
    intro: '',
    showIntro: false,
    bullets: [
      { id: 'b11', text: 'Подписали LOI с 3 брендами' },
    ],
    sections: [],
    createdAt: '2026-03-02T08:00:00Z',
  },
];

// Helper to format week range in Russian
export function formatWeekRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]}`;
}

export function formatWeekRangeWithYear(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  return `${formatWeekRange(start, end)} ${s.getFullYear()}`;
}

// Generate weeks list
export function getWeeksList(count = 8): { weekStart: string; weekEnd: string }[] {
  const weeks: { weekStart: string; weekEnd: string }[] = [];
  const baseMonday = new Date('2026-03-10');
  for (let i = 0; i < count; i++) {
    const monday = new Date(baseMonday);
    monday.setDate(monday.getDate() - i * 7);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    weeks.push({
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: sunday.toISOString().split('T')[0],
    });
  }
  return weeks;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getSprintWordCount(sprint: { intro: string; bullets: { text: string }[]; sections: { content: string }[] }): number {
  let count = countWords(sprint.intro);
  sprint.bullets.forEach(b => { count += countWords(b.text); });
  sprint.sections.forEach(s => { count += countWords(s.content); });
  return count;
}

export function getReadingTime(words: number): number {
  return Math.max(1, Math.ceil(words / 200));
}
