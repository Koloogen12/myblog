import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ===== TYPES =====

export interface HomeContent {
  heroKicker: string; // small uppercase label above H1, e.g. "Блог Данила Кочнева"
  heroTitle: string; // multiline (newlines rendered as <br>)
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  sidebarBio: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TimelineItem {
  age: string; // "18" / "19"
  year: string; // "2018"
  title: string;
  description: string;
  url?: string;
}

export interface AboutContent {
  heading: string;
  mainBio: string;
  stats: StatItem[];
  secondaryBio: string;
  blogDescription: string;
  timelineHeading: string;
  timeline: TimelineItem[];
  ctaHeading: string;
  ctaText: string;
  ctaButtonText: string;
  ctaButtonLink: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  emoji: string; // shown if iconImage is empty
  iconImage?: string; // optional uploaded/external image URL — overrides emoji
  iconFit?: 'cover' | 'contain'; // 'cover' = fill/crop (photos), 'contain' = fit whole logo
  iconBg?: string; // optional bg color behind icon when iconFit='contain' (e.g. '#000' for dark logos)
  year: string;
  tagline: string;
  description: string;
  status: string; // 'active' | 'growth' | 'launched' | 'archive'
  statusLabel: string;
  tags: string[];
  metrics?: string;
  url?: string;
}

export interface ProjectsContent {
  heading: string;
  description: string;
  activeHeading: string;
  archiveHeading: string;
  projects: ProjectItem[];
  ctaHeading: string;
  ctaText: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
}

// ===== DEFAULTS (fallback when DB empty) =====

export const DEFAULT_HOME: HomeContent = {
  heroKicker: 'Блог Данила Кочнева',
  heroTitle: 'Строю продукты.\nПоказываю как.',
  heroSubtitle:
    'С 2018 года основал больше 6 продуктов — от рекламных технологий до B2B маркетплейсов и AI. Привлёк $150K инвестиций. Пишу о том, как строить продукты, думать как фаундер и использовать AI.',
  heroCtaText: 'Обо мне →',
  heroCtaLink: '/about',
  sidebarBio: 'Серийный IT-предприниматель. Строю THE MONO, NEURIN AI и MakeMeLook.ai.',
};

export const DEFAULT_ABOUT: AboutContent = {
  heading: 'Данил Кочнев',
  mainBio:
    'Серийный IT-предприниматель с 2018 года.\n\nЗа 8 лет основал больше 6 продуктов — от рекламных технологий до B2B маркетплейсов и AI. Привлёк $150K инвестиций.\n\nСейчас строю NEURIN AI — Product Intelligence System для фаундеров, THE MONO — wholesale маркетплейс для fashion-индустрии РФ и СНГ, и MakeMeLook.ai — AI-виджеты для e-commerce.',
  stats: [
    { value: '6+', label: 'продуктов' },
    { value: '8', label: 'лет в IT' },
    { value: '4', label: 'компании' },
  ],
  secondaryBio:
    'Помогаю фаундерам и продактам строить продукты правильно — от идеи до первых платящих клиентов.',
  blogDescription:
    'Этот блог — место, где я думаю вслух. Пишу о продуктах, AI, инвестициях и о том, как строить компании в реальном времени. Без учебников. Только то, что проверено на практике.',
  timelineHeading: 'Путь',
  timeline: [
    {
      age: '18',
      year: '2018',
      title: 'Начало пути',
      description: 'Первый IT-продукт. Понял: предпринимательство — это навсегда.',
    },
    {
      age: '19',
      year: '2019',
      title: 'THÉ MONO',
      description:
        'Основал маркетплейс для B2B-закупок в лёгкой промышленности.',
      url: 'https://themono.ru',
    },
    {
      age: '20',
      year: '2020',
      title: 'THÉ ADSY',
      description: 'Запустил рекламные технологии. Первая статья на vc.ru.',
      url: 'https://theadsy.ru',
    },
    {
      age: '21',
      year: '2021',
      title: 'Monobox',
      description:
        'Эксперимент с подписочными боксами — первый опыт D2C.',
    },
    {
      age: '23',
      year: '2023',
      title: '$100K инвестиций',
      description:
        'Инвестор нашёл через статью на vc.ru три года спустя. Переезд в Москву. Всё серьёзно.',
    },
    {
      age: '24',
      year: '2024',
      title: 'MakeMeLook.ai',
      description:
        'AI-стилист с виртуальной примеркой для онлайн-магазинов. $50K pre-seed.',
    },
    {
      age: '25',
      year: '2025',
      title: 'NEURIN AI',
      description: 'Cursor для фаундеров и продактов. Сделал под запрос YC.',
    },
    {
      age: '26',
      year: '2026',
      title: 'Сейчас',
      description:
        'Масштабирую THE MONO. Вхожу в Китай. Строю в реальном времени.',
    },
  ],
  ctaHeading: 'Хочешь следить за процессом?',
  ctaText: 'Подпишись на Telegram-канал — там обновления в реальном времени.',
  ctaButtonText: '@kochnev_blog →',
  ctaButtonLink: 'https://t.me/kochnev_blog',
};

export const DEFAULT_PROJECTS: ProjectsContent = {
  heading: 'Проекты',
  description:
    'Каждый продукт — это гипотеза, которую я проверяю рынком. Некоторые растут, некоторые учат. Все двигают вперёд.',
  activeHeading: 'Активные проекты',
  archiveHeading: 'Запущенные ранее',
  projects: [
    {
      id: 'neurin',
      name: 'NEURIN AI',
      emoji: '🧠',
      year: '2025',
      tagline: 'Product Intelligence System',
      description:
        'Product Intelligence System для фаундеров и продуктовых команд. Единая среда, где AI знает всё о твоём продукте — и помогает принять следующее решение. Данные из интервью → сегменты → роадмап. Не таск-трекер и не чат с GPT. Есть первые оплаты.',
      status: 'active',
      statusLabel: 'В активной разработке',
      tags: ['AI', 'SaaS', 'Product'],
      metrics: 'Первые оплаты',
    },
    {
      id: 'themono',
      name: 'THE MONO',
      emoji: '⚡',
      year: '2019',
      tagline: 'B2B fashion wholesale',
      description:
        'B2B wholesale маркетплейс для fashion-индустрии РФ и СНГ. Соединяет бренды из Кыргызстана, Узбекистана, Грузии и Китая с ритейлерами. 300+ верифицированных брендов, 50+ ритейлеров. $200K инвестиций.',
      status: 'growth',
      statusLabel: 'Растёт',
      tags: ['Marketplace', 'B2B', 'Fashion'],
      metrics: '300+ брендов',
      url: 'https://themono.ru',
    },
    {
      id: 'makemelook',
      name: 'MakeMeLook.ai',
      emoji: '👗',
      year: '2024',
      tagline: 'AI-виджеты для fashion e-commerce',
      description:
        'AI-виджеты для fashion e-commerce. AI-стилист + виртуальная примерка для онлайн-магазинов одежды. Setup за неделю, интеграция в любой сайт. $100K pre-seed.',
      status: 'growth',
      statusLabel: 'Растёт',
      tags: ['AI', 'Fashion-tech', 'E-commerce'],
      metrics: '$100K pre-seed',
      url: 'https://makemelook.ai',
    },
    {
      id: 'carswap',
      name: 'CarSwap AI',
      emoji: '🚗',
      year: '2025',
      tagline: 'AI-визуализация оклейки',
      description:
        'AI-визуализация оклейки автомобиля для детейлинг-центров. Фото машины → визуализация в новом цвете за 15–30 секунд. Единственное решение в РФ с поддержкой китайских плёнок (95% рынка).',
      status: 'active',
      statusLabel: 'В активной разработке',
      tags: ['AI', 'Automotive', 'SaaS'],
    },
    {
      id: 'theadsy',
      name: 'THÉ ADSY',
      emoji: '📊',
      year: '2020',
      tagline: 'Рекламные технологии',
      description:
        'Платформа для автоматизации рекламных кампаний. Programmatic buying, аналитика, оптимизация бюджетов через ML.',
      status: 'launched',
      statusLabel: 'Запущен',
      tags: ['AdTech', 'ML', 'Automation'],
      url: 'https://theadsy.ru',
    },
    {
      id: 'monobox',
      name: 'Monobox',
      emoji: '📦',
      year: '2021',
      tagline: 'Подписочные боксы',
      description:
        'D2C эксперимент с подписочной моделью. Первый опыт прямых продаж потребителю и управления физической логистикой.',
      status: 'archive',
      statusLabel: 'Архив',
      tags: ['D2C', 'Subscription', 'E-commerce'],
    },
  ],
  ctaHeading: 'Хотите так же?',
  ctaText:
    'Я помогаю стартапам и командам строить продукты — от идеи до product-market fit.',
  ctaPrimaryText: 'Бесплатная консультация',
  ctaPrimaryLink: 'https://qlick.io/ru/widget/kochnev/free-consult/start',
  ctaSecondaryText: 'Обо мне',
  ctaSecondaryLink: '/about',
};

// ===== LINKHUB =====

export const SOCIAL_PLATFORMS = [
  'instagram',
  'youtube',
  'telegram',
  'telegram_channel',
  'linkedin',
  'twitter',
  'vc',
  'github',
  'email',
  'website',
  'custom',
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export interface LinkhubSocial {
  platform: SocialPlatform;
  url: string;
  customLabel?: string;
  visible: boolean;
}

export interface LinkhubTile {
  id: string;
  emoji: string; // emoji OR empty if iconImage set
  iconImage?: string; // optional image URL for icon (Tilda-style logos)
  iconFit?: 'cover' | 'contain'; // 'cover' = fill/crop (photos), 'contain' = fit whole logo
  iconBg?: string; // optional bg color behind icon when iconFit='contain' (e.g. '#3229ff' for THE ADSY)
  title: string;
  description: string;
  url: string;
  visible: boolean;
  accent?: boolean; // highlighted card style
  variant?: 'default' | 'compact' | 'featured' | 'logo'; // layout variant
  buttonText?: string; // "Забрать", "Забронировать", "Подписаться", "Перейти" etc.
}

export interface LinkhubSection {
  id: string;
  heading: string; // empty = no heading rendered
  headingLinkLabel?: string; // optional link shown on the right side of heading, e.g. "Перейти в блог →"
  headingLinkUrl?: string;
  tiles: LinkhubTile[];
  visible: boolean;
}

export interface LinkhubFooterLink {
  label: string;
  url: string;
}

export interface LinkhubContent {
  heroImage?: string; // cover image above avatar (Tilda hero banner). Falls back to nothing.
  heroTitle: string;
  heroSubtitle: string;
  showAvatar: boolean;
  sections: LinkhubSection[];
  socials: LinkhubSocial[];
  footerText: string;
  footerLinks: LinkhubFooterLink[];
}

export const DEFAULT_LINKHUB: LinkhubContent = {
  heroImage: '/lander/figma/bg-v2.webp',
  heroTitle: 'Превращаю большие идеи\nв большие компании',
  heroSubtitle:
    'Привет, рад тебя видеть!\nЯ – Данил Кочнев. Серийный IT-предприниматель, развиваю свои компании, иду к IPO и помогаю создавать продукты, которые с удовольствием покупают.\nПредприниматель или только планируешь? Давай знакомиться!',
  showAvatar: false,
  sections: [
    {
      id: 'useful',
      heading: 'Будет полезно:',
      headingLinkLabel: 'Перейти в блог →',
      headingLinkUrl: '/blog',
      visible: true,
      tiles: [
        {
          id: 'mvp',
          emoji: '',
          iconImage: '/lander/figma/card-mvp.png',
          title: '«Как создать успешный продукт»',
          description:
            'Подробное пошаговое руководство, как превратить идею в рабочий стартап.',
          url: 'https://charm-penalty-bb9.notion.site/MVP-13e947c1f44280f8a699f785cc89cd15',
          visible: true,
          variant: 'featured',
          buttonText: 'Забрать',
        },
        {
          id: 'calendar',
          emoji: '',
          iconImage: '/lander/figma/card-calendar.png',
          title: 'Календарь бесплатных консультаций',
          description: 'Есть вопрос по продукту и бизнесу? Выбери слот в календаре.',
          url: 'https://qlick.io/ru/widget/kochnev/free-consult/start',
          visible: true,
          variant: 'featured',
          buttonText: 'Забронировать',
        },
        {
          id: 'tg',
          emoji: '',
          iconImage: '/lander/figma/card-tg.png',
          title: 'Подписывайся на мой тг-канал',
          description:
            'Делюсь сильно-сжатым опытом по созданию успешного продукта',
          url: 'https://t.me/kochnev_blog',
          visible: true,
          variant: 'featured',
          buttonText: 'Подписаться',
        },
      ],
    },
    {
      id: 'companies',
      heading: 'Мои компании:',
      visible: true,
      tiles: [
        {
          id: 'themono',
          emoji: '',
          iconImage: '/lander/figma/logo-mono.png',
          iconFit: 'contain',
          iconBg: '#000000',
          title: 'THE MONO – B2B Маркетплейс',
          description:
            'Мой основной продукт, основанный в 2021 году. Объединяем бренды, ТМ и фабрики с розничными магазинами',
          url: 'https://themono.ru',
          visible: true,
          variant: 'featured',
          buttonText: 'Перейти',
        },
        {
          id: 'mml',
          emoji: '',
          iconImage: '/lander/figma/logo-mml.png',
          iconFit: 'contain',
          iconBg: '#000000',
          title: 'MML (Virtual Stylist)',
          description:
            'Технология виртуальной примерки с функциями ИИ-стилиста',
          url: 'https://b2b.makemelook.ai',
          visible: true,
          variant: 'featured',
          buttonText: 'Перейти',
        },
        {
          id: 'adsy',
          emoji: '',
          iconImage: '/lander/figma/logo-adsy.png',
          iconFit: 'contain',
          iconBg: '#3229ff',
          title: 'THE ADSY – Студия разработки',
          description:
            'Внедряем ИИ в ваши бизнес-процессы, создаем IT-продукты любой сложности',
          url: 'https://theadsy.ru',
          visible: true,
          variant: 'featured',
          buttonText: 'Перейти',
        },
        {
          id: 'buyback',
          emoji: '',
          iconImage: '/lander/figma/logo-buyback.png',
          iconFit: 'contain',
          iconBg: '#d2d2d2',
          title: 'BUYBACK – Обратный выкуп',
          description:
            'Сервис гарантированного обратного выкупа одежды у ваших клиентов в ваших интернет-магазинах',
          url: 'https://disk.yandex.ru/d/EdQaU8CeMZ9COA',
          visible: true,
          variant: 'featured',
          buttonText: 'Перейти',
        },
      ],
    },
  ],
  socials: [
    {
      platform: 'youtube',
      url: 'https://youtube.com/@kochnefff',
      visible: true,
      customLabel: '@kochnefff',
    },
    {
      platform: 'telegram_channel',
      url: 'https://t.me/kochnev_blog',
      visible: true,
      customLabel: '@kochnefff',
    },
    {
      platform: 'linkedin',
      url: 'https://linkedin.com/in/kochnefff',
      visible: true,
      customLabel: '@kochnefff',
    },
    {
      platform: 'instagram',
      url: 'https://instagram.com/kochnefff',
      visible: true,
      customLabel: '@kochnefff',
    },
  ],
  footerText: '© 2026 Danil Kochnev',
  footerLinks: [
    { label: 'Публичная оферта', url: 'https://kochnev.me/offerta' },
    {
      label: 'Политика конфиденциальности',
      url: 'https://kochnev.me/politika-pers-dannyh',
    },
  ],
};

// ===== GENERIC READ/WRITE =====

async function fetchContent<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return fallback;
  // Merge fallback with stored data so new fields from defaults are included
  return { ...fallback, ...(data.value as object) } as T;
}

async function upsertContent<T>(key: string, value: T): Promise<void> {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value: value as object }, { onConflict: 'key' });
  if (error) throw error;
}

// ===== HOOKS =====

// Site-settings barely change. Keep them cached for 5 minutes so back/forward
// navigation doesn't refetch and flash defaults again. Per react-query: data
// older than staleTime triggers a background refetch on mount.
const SITE_STALE_TIME = 5 * 60 * 1000;

export function useHomeContent() {
  return useQuery({
    queryKey: ['site_settings', 'home'],
    queryFn: () => fetchContent<HomeContent>('home', DEFAULT_HOME),
    staleTime: SITE_STALE_TIME,
  });
}

export function useAboutContent() {
  return useQuery({
    queryKey: ['site_settings', 'about'],
    queryFn: () => fetchContent<AboutContent>('about', DEFAULT_ABOUT),
    staleTime: SITE_STALE_TIME,
  });
}

export function useProjectsContent() {
  return useQuery({
    queryKey: ['site_settings', 'projects'],
    queryFn: () => fetchContent<ProjectsContent>('projects', DEFAULT_PROJECTS),
    staleTime: SITE_STALE_TIME,
  });
}

export function useUpdateHomeContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: HomeContent) => upsertContent('home', v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site_settings', 'home'] }),
  });
}

export function useUpdateAboutContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: AboutContent) => upsertContent('about', v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site_settings', 'about'] }),
  });
}

export function useUpdateProjectsContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: ProjectsContent) => upsertContent('projects', v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site_settings', 'projects'] }),
  });
}

// Legacy hero path that was deployed as an empty 0-byte placeholder.
// Browsers cached that broken file with `immutable, max-age=1y`, so simply
// fixing the file leaves every returning visitor with a black background.
// Mapping the legacy path to a new filename here busts that cache without
// touching the DB. Once the user uploads a fresh hero through the admin
// the DB value changes and this override drops out automatically.
const LEGACY_HERO_PATH = '/lander/figma/bg.webp';
const HERO_CACHEBUST_PATH = '/lander/figma/bg-v2.webp';

export function useLinkhubContent() {
  return useQuery({
    queryKey: ['site_settings', 'linkhub'],
    queryFn: async () => {
      const data = await fetchContent<LinkhubContent>('linkhub', DEFAULT_LINKHUB);
      if (data.heroImage === LEGACY_HERO_PATH) {
        return { ...data, heroImage: HERO_CACHEBUST_PATH };
      }
      return data;
    },
    staleTime: SITE_STALE_TIME,
  });
}

export function useUpdateLinkhubContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: LinkhubContent) => upsertContent('linkhub', v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['site_settings', 'linkhub'] }),
  });
}
