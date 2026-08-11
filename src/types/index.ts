/** One question/answer pair; powers the FAQ block and FAQPage schema. */
export interface FaqItem {
  question: string;
  answer: string;
}

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

  // ── SEO / GEO ───────────────────────────────────────────────────────────
  /** Overrides <title>; falls back to `title`. Target <= 60 chars. */
  seo_title?: string | null;
  /** Overrides meta description; falls back to `excerpt`. Target <= 160. */
  seo_description?: string | null;
  /** Target keywords — for topical mapping, NOT for stuffing into copy. */
  keywords?: string[] | null;
  /** The single query this post is meant to win. */
  focus_keyword?: string | null;
  /** 40-60 word self-contained summary; what AI engines quote. */
  tldr?: string | null;
  /** Q&A pairs rendered as an FAQ block and emitted as FAQPage schema. */
  faq?: FaqItem[] | null;
  /** Per-post social image; falls back to `cover_image_url`. */
  og_image?: string | null;
  /** When the AI generator last filled these fields. */
  seo_generated_at?: string | null;
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
