import { Link } from 'react-router-dom';
import { ExternalLink, Menu } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath } from '@/lib/locale';

const Header = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const locale = useLocale();
  // Local helper so every internal Link keeps the current locale prefix.
  const lp = (path: string) => localizedPath(path, locale);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Name */}
        <Link to={lp('/')} className="text-lg font-semibold font-display text-foreground hover:opacity-70 transition-opacity">
          {locale === 'en' ? 'Danil Kochnev' : 'Данил Кочнев'}
        </Link>

        {/* Right: Nav */}
        <div className="flex items-center gap-1 sm:gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link to={lp('/blog')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('header.blog')}
            </Link>
            <Link to={lp('/projects')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('header.projects')}
            </Link>
            <a
              href="https://charm-penalty-bb9.notion.site/MVP-13e947c1f44280f8a699f785cc89cd15"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              {t('header.ideaToMvp')}
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
            <a
              href="https://qlick.io/ru/widget/kochnev/free-consult/start"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              {t('header.consultation')}
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </nav>

          <LanguageSwitcher />
          <ThemeToggle />

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label={t('header.blog')}>
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-6 pt-12 bg-background border-border">
                <SheetTitle className="sr-only">{t('header.blog')}</SheetTitle>
                <nav className="flex flex-col gap-4 mb-6">
                  <Link to={lp('/blog')} onClick={() => setOpen(false)} className="text-sm text-foreground font-medium">{t('header.blog')}</Link>
                  <Link to={lp('/projects')} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">{t('header.projects')}</Link>
                  <a href="https://charm-penalty-bb9.notion.site/MVP-13e947c1f44280f8a699f785cc89cd15" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    {t('header.ideaToMvp')} <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                  <a href="https://qlick.io/ru/widget/kochnev/free-consult/start" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    {t('header.consultation')} <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </nav>
                <div className="mb-6">
                  <LanguageSwitcher layout="menu" />
                </div>
                <Sidebar onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
