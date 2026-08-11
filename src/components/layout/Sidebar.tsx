import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@/hooks/useCategories';
import { useHomeContent, DEFAULT_HOME } from '@/hooks/useSiteContent';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath } from '@/lib/locale';

interface SidebarProps {
  onNavigate?: () => void;
}

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const locale = useLocale();
  const lp = (path: string) => localizedPath(path, locale);
  // Recognise /tag/<slug> in both locales.
  const tagMatch = location.pathname.match(/\/tag\/([^/]+)/);
  const currentTag = tagMatch?.[1] ?? null;

  const { data: categories = [] } = useCategories();
  const { data: home = DEFAULT_HOME } = useHomeContent();

  // Flat list — sort by existing sort_order
  const sorted = [...categories].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  return (
    <aside className="space-y-8">
      {sorted.length > 0 && (
        <div>
          <p className="text-[11px] text-muted-foreground mb-3 font-display">{t('sidebar.categories')}</p>
          <div className="flex flex-col gap-0.5">
            {sorted.map(cat => (
              <Link
                key={cat.slug}
                to={lp(`/tag/${cat.slug}`)}
                onClick={onNavigate}
                className={`text-sm py-1 transition-colors duration-200 ${
                  currentTag === cat.slug
                    ? 'text-foreground font-semibold'
                    : 'text-foreground/80 hover:text-foreground'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="w-16 h-px bg-border" />

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-muted-foreground text-[11px] mb-1">{t('sidebar.telegramChannel')}</p>
          <a
            href="https://t.me/kochnev_blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @kochnev_blog
          </a>
        </div>
        <div>
          <p className="text-muted-foreground text-[11px] mb-1">{t('sidebar.socials')}</p>
          <div className="flex gap-1.5 flex-wrap">
            <a
              href="https://www.instagram.com/kochnefff/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Instagram
            </a>
            <span className="text-muted-foreground">,</span>
            <a
              href="https://www.linkedin.com/in/kochnefff/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="w-16 h-px bg-border" />

      <div className="space-y-1 text-sm text-muted-foreground">
        <p className="whitespace-pre-line">{home.sidebarBio}</p>
        <p className="mt-3">
          <Link
            to={lp('/about')}
            onClick={onNavigate}
            className="text-primary hover:underline"
          >
            {t('sidebar.aboutMe')}
          </Link>
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
