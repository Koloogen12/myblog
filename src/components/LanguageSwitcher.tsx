import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { switchLocale, LOCALES, type Locale } from '@/lib/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Props {
  /** "header" = inline pill; "menu" = stacked column for mobile sheet. */
  layout?: 'header' | 'menu';
}

/**
 * Two-state pill (RU | EN). Clicking the inactive locale rewrites the current
 * URL with the right prefix and lets the router re-render. Active locale is
 * styled as the foreground. Locale state lives entirely in the URL.
 */
const LanguageSwitcher = ({ layout = 'header' }: Props) => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const current = useLocale();
  const { t } = useTranslation();

  const go = (target: Locale) => {
    if (target === current) return;
    navigate(switchLocale(pathname, target) + search + hash);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={
              layout === 'menu'
                ? 'inline-flex items-center gap-1 rounded-md border border-border p-0.5 self-start'
                : 'hidden sm:inline-flex items-center gap-1 rounded-md border border-border p-0.5'
            }
            role="group"
            aria-label={t('common.language')}
          >
            {LOCALES.map(l => {
              const active = l === current;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => go(l)}
                  aria-pressed={active}
                  className={
                    'px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider rounded transition-colors ' +
                    (active
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground')
                  }
                >
                  {l}
                </button>
              );
            })}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {t('common.language')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LanguageSwitcher;
