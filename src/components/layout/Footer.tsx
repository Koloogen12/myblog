import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CATEGORIES } from '@/types';
import { MOCK_POSTS } from '@/lib/mock-data';
import { Send, Linkedin, Instagram, Newspaper, Rss } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath } from '@/lib/locale';

const socials = [
  { name: 'Telegram', url: 'https://t.me/kochnev_blog', Icon: Send },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/kochnefff/', Icon: Linkedin },
  { name: 'Instagram', url: 'https://www.instagram.com/kochnefff/', Icon: Instagram },
  { name: 'VC.ru', url: 'https://vc.ru/u/618305-danil-kochnev', Icon: Newspaper },
];

const Footer = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const lp = (path: string) => localizedPath(path, locale);
  const nonEmptyCategories = CATEGORIES.filter(cat =>
    MOCK_POSTS.some(p => p.is_published && p.category === cat.slug),
  );

  return (
    <footer className="border-t border-border bg-card/50 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link to={lp('/')} className="text-lg font-semibold font-display text-foreground">
              {t('footer.name')}
            </Link>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
              {t('footer.brandSubline')}
            </p>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('footer.categories')}</p>
            <div className="flex flex-col gap-1.5">
              {nonEmptyCategories.map(cat => (
                <Link
                  key={cat.slug}
                  to={lp(`/tag/${cat.slug}`)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Socials */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('footer.socials')}</p>
            <div className="flex flex-col gap-2">
              {socials.map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <s.Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  {s.name}
                </a>
              ))}
            </div>
            <a
              href="mailto:ceo@themono.ru"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-3 block"
            >
              ceo@themono.ru
            </a>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-4">
            <Link to={lp('/projects')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t('footer.projects')}
            </Link>
            <Link to={lp('/about')} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t('footer.about')}
            </Link>
            <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              <Rss className="w-3 h-3" /> RSS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
