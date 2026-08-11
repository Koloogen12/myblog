import { useState, useEffect } from 'react';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentHtml?: string | null;
}

const TableOfContents = ({ contentHtml }: TableOfContentsProps) => {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Parse headings from DOM after render
  useEffect(() => {
    const timer = setTimeout(() => {
      const article = document.querySelector('.prose');
      if (!article) return;

      const headings = article.querySelectorAll('h2, h3');
      const tocItems: TocItem[] = [];

      headings.forEach((heading, i) => {
        // Ensure heading has an ID for scroll targeting
        if (!heading.id) {
          heading.id = `heading-${i}`;
        }
        tocItems.push({
          id: heading.id,
          text: heading.textContent || '',
          level: heading.tagName === 'H2' ? 2 : 3,
        });
      });

      setItems(tocItems);
    }, 100);

    return () => clearTimeout(timer);
  }, [contentHtml]);

  // Track active heading on scroll
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    items.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="hidden xl:block fixed right-[max(1rem,calc((100vw-768px)/2-320px))] top-32 w-56 max-h-[calc(100vh-10rem)] overflow-y-auto">
      <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <List className="w-3.5 h-3.5" />
        Содержание
      </div>
      <ul className="space-y-1 border-l border-border">
        {items.map(item => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`block text-xs leading-relaxed transition-colors py-0.5 ${
                item.level === 3 ? 'pl-5' : 'pl-3'
              } ${
                activeId === item.id
                  ? 'text-primary border-l-2 border-primary -ml-px font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
