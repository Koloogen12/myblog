export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  content_json?: Record<string, unknown> | null;
  content_html?: string | null;
  excerpt?: string;
  cover_image_url?: string;
  category: string;
  rating?: number;
  reading_time: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryInfo {
  name: string;
  slug: string;
  group: 'synthesize' | 'distill';
}

// Legacy compat — re-exported from useCategories hook for dynamic usage
// Kept as fallback if categories haven't loaded yet
export const CATEGORIES: CategoryInfo[] = [
  { name: 'Мысли', slug: 'thoughts', group: 'synthesize' },
  { name: 'Мета', slug: 'meta', group: 'synthesize' },
  { name: 'Принципы', slug: 'principles', group: 'synthesize' },
  { name: 'Подкаст', slug: 'podcast', group: 'synthesize' },
  { name: 'Книги', slug: 'books', group: 'distill' },
  { name: 'Ссылки', slug: 'links', group: 'distill' },
];
