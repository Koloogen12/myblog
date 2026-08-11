import {
  User, Package, TrendingUp, Target, CalendarDays,
  type LucideIcon,
} from 'lucide-react';

export interface ContextEntry {
  id: string;
  category: 'bio' | 'product' | 'trend' | 'goal' | 'event';
  title: string;
  content: string;
  is_active: boolean;
  updated_at: string;
}

export const CATEGORY_CONFIG: Record<ContextEntry['category'], { Icon: LucideIcon; label: string }> = {
  bio: { Icon: User, label: 'Биография' },
  product: { Icon: Package, label: 'Продукт' },
  trend: { Icon: TrendingUp, label: 'Тренд' },
  goal: { Icon: Target, label: 'Цель' },
  event: { Icon: CalendarDays, label: 'Событие' },
};

export const PRODUCT_COLORS = ['hsl(210 80% 55%)', 'hsl(270 60% 55%)', 'hsl(340 70% 55%)', 'hsl(160 60% 45%)'];

export const MOCK_CONTEXT: ContextEntry[] = [
  {
    id: 'bio', category: 'bio', title: 'Биография и бэкграунд', is_active: true,
    updated_at: '2026-03-05T10:00:00Z',
    content: `Данил Кочнев, 27 лет. Из Кемерово, живу в Москве.

Serial founder с 2018 года. 6 продуктов за 7 лет.

Текущие продукты: MakeMeLook (AI виртуальная примерка), CarSwap AI (AI перекраска авто), THE MONO (B2B маркетплейс), Cursor for Founders (AI инструмент для фаундеров).

Привлёк $150K pre-seed суммарно. Подавал в YC 3 раза. Долг ~2 млн руб.

Цель: личный бренд → курс → Cursor for Founders → YC.

Стиль общения: прямой, без воды, с конкретикой и цифрами.`,
  },
  {
    id: 'ml', category: 'product', title: 'MakeMeLook', is_active: true,
    updated_at: '2026-03-08T14:00:00Z',
    content: `AI виртуальная примерка для fashion e-commerce.
Pre-seed $50K. B2B SaaS виджет для интернет-магазинов.

Статус (март 2026):
- Переговоры с ЦУМом — ждём ответ 2 недели, нужен follow-up
- ФИТ от Рокетбанка — провели демо, заинтересованы, ждём коммерческое
- Запрос от Stefano Ricci — хотят iOS-приложение, тормозят
- Продукт готов к пилоту, нужен первый платный клиент

Ближайшая цель: закрыть первый пилот за 200–500K ₽.`,
  },
  {
    id: 'cs', category: 'product', title: 'CarSwap AI', is_active: true,
    updated_at: '2026-03-09T11:00:00Z',
    content: `AI перекраска автомобиля для детейлинг-центров.
Тариф Professional: 260K ₽/год.

Статус (март 2026):
- 8 детейлинг-центров попросили тест
- Конверсия в оплату пока 0% — нужно понять почему
- Онбординг не выстроен
- Product-market fit под вопросом

Ближайшая цель: конвертировать хотя бы 1 из 8 тестов в оплату.`,
  },
  {
    id: 'mono', category: 'product', title: 'THE MONO', is_active: true,
    updated_at: '2026-03-01T09:00:00Z',
    content: `B2B маркетплейс для локальных fashion-брендов и ритейлеров.
Pre-seed $100K. ~11 брендов в бете.

Статус (март 2026):
- Активных сделок нет, развитие заморожено
- Фокус переключён на MakeMeLook и CarSwap

Ближайшая цель: закрыть раунд или заморозить до лучших времён.`,
  },
  {
    id: 'cff', category: 'product', title: 'Cursor for Founders', is_active: false,
    updated_at: '2026-02-20T16:00:00Z',
    content: `AI workspace для фаундеров и продактов на основе AJTBD-методологии.
Концепция готова (13 экранов). MVP ещё не сделан.

Планируется: генерация прототипа в Lovable + подача в YC.

Статус: идея, не активна.`,
  },
  {
    id: 'trend1', category: 'trend', title: 'Тренды (март 2026)', is_active: true,
    updated_at: '2026-03-07T08:00:00Z',
    content: `• Vibe coding набирает обороты: Lovable, Bolt, Replit Agent — неделями в топе HN
- LinkedIn carousel engagement вырос ~40% YoY — хороший формат сейчас
- AI agents в B2B продуктах: все добавляют "AI agent" в фичи
- Fashion tech: после провала AR у Zalando рынок ищет более практичные решения
- Build-in-public тренд: аудитория голосует за честность, не за polish`,
  },
  {
    id: 'goal1', category: 'goal', title: 'Цели Q1 2026', is_active: true,
    updated_at: '2026-03-06T12:00:00Z',
    content: `1. Закрыть первую платную сделку MakeMeLook (пилот ≥200K ₽)
2. Запустить блог — первые 5 постов опубликованы
3. Telegram-канал @kochnefff — первые 100 подписчиков
4. CarSwap: понять почему нет конверсии из теста

Срок: 31 марта 2026.`,
  },
];
