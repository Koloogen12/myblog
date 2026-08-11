import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import ScrollToTop from '@/components/ScrollToTop';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useProjectsContent,
  DEFAULT_PROJECTS,
  type ProjectItem,
} from '@/hooks/useSiteContent';
import { proxyUrl } from '@/lib/storage';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { localizedPath } from '@/lib/locale';

const statusConfig: Record<
  string,
  { color: string; dot: string; pulse: boolean }
> = {
  active: { color: 'text-green-600 dark:text-green-400', dot: 'bg-green-500', pulse: true },
  growth: { color: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500', pulse: false },
  launched: { color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', pulse: false },
  archive: { color: 'text-muted-foreground', dot: 'bg-muted-foreground', pulse: false },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

// Empty parent variant — just needed so framer-motion propagates the
// "hidden" / "visible" state string down to <ProjectCard> children via the
// standard variants channel. Without this, `whileInView` on the parent silently
// fails to trigger children when the list is above the fold (recent
// framer-motion regression), leaving every card stuck at opacity: 0.
const fadeParent = { hidden: {}, visible: {} };

const ProjectsPage = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const lp = (path: string) => localizedPath(path, locale);
  const { data: content = DEFAULT_PROJECTS } = useProjectsContent();
  const projects = content.projects || [];
  const active = projects.filter(p => p.status === 'active' || p.status === 'growth');
  const past = projects.filter(p => p.status === 'launched' || p.status === 'archive');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={content.heading}
        description={content.description}
        path="/projects"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${content.heading} Данила Кочнева`,
          description: content.description,
          url: 'https://dkochnev.com/projects',
          author: { '@type': 'Person', name: 'Данил Кочнев' },
        }}
      />
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold font-display mb-3">{content.heading}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            {content.description}
          </p>
        </motion.div>

        {/* Active Projects */}
        {active.length > 0 && (
          <section className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold uppercase tracking-wider text-primary mb-6"
            >
              {content.activeHeading}
            </motion.h2>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeParent}
              className="grid gap-5"
            >
              {active.map((project, i) => (
                <ProjectCard
                  key={project.id || project.name}
                  project={project}
                  index={i}
                  featured
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* Past Projects */}
        {past.length > 0 && (
          <section className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6"
            >
              {content.archiveHeading}
            </motion.h2>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeParent}
              className="grid gap-4"
            >
              {past.map((project, i) => (
                <ProjectCard
                  key={project.id || project.name}
                  project={project}
                  index={i + active.length}
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* CTA */}
        {content.ctaHeading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-8 text-center mb-8"
          >
            <p className="text-2xl font-display font-bold mb-2">{content.ctaHeading}</p>
            {content.ctaText && (
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{content.ctaText}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {content.ctaPrimaryText && content.ctaPrimaryLink && (
                <a
                  href={content.ctaPrimaryLink}
                  target={content.ctaPrimaryLink.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  {content.ctaPrimaryText}
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
              {content.ctaSecondaryText && content.ctaSecondaryLink && (
                <Link
                  to={content.ctaSecondaryLink}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-secondary transition-colors"
                >
                  {content.ctaSecondaryText}
                </Link>
              )}
            </div>
          </motion.div>
        )}

        <Link
          to={lp('/')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('common.backHome')}
        </Link>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

const ProjectCard = ({
  project,
  index,
  featured,
}: {
  project: ProjectItem;
  index: number;
  featured?: boolean;
}) => {
  const status = statusConfig[project.status] || statusConfig.active;
  const Wrapper = project.url ? 'a' : 'div';
  const wrapperProps = project.url
    ? { href: project.url, target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  // No entrance animation on the card — a slow-to-decode iconImage was
  // causing framer-motion's variants pipeline to leave the first card stuck
  // at opacity: 0. Simpler + always correct.
  void index;
  return (
    <>
      <Wrapper
        {...wrapperProps}
        className={`block rounded-xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 group ${
          project.url ? 'hover:border-primary/40 hover:shadow-md cursor-pointer' : ''
        } ${featured ? 'sm:p-7' : ''}`}
      >
        <div className="flex items-start gap-4">
          {project.iconImage ? (
            <div
              className={`${featured ? 'w-14 h-14' : 'w-11 h-11'} rounded-xl overflow-hidden shrink-0 flex items-center justify-center`}
              style={{
                backgroundColor:
                  project.iconFit === 'contain'
                    ? project.iconBg || 'transparent'
                    : undefined,
              }}
            >
              <img
                src={proxyUrl(project.iconImage)}
                alt={project.name}
                className={`w-full h-full ${
                  project.iconFit === 'contain' ? 'object-contain p-1.5' : 'object-cover'
                }`}
                loading="lazy"
              />
            </div>
          ) : (
            <div
              className={`${featured ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-xl'} rounded-xl bg-primary/10 flex items-center justify-center shrink-0`}
            >
              {project.emoji}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3
                className={`font-semibold font-display ${featured ? 'text-lg' : 'text-base'} group-hover:text-primary transition-colors`}
              >
                {project.name}
              </h3>
              <span className="text-xs text-muted-foreground">{project.year}</span>
              {project.url && (
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">{project.tagline}</p>

            {featured && (
              <p className="text-sm text-muted-foreground/80 leading-relaxed mb-3">
                {project.description}
              </p>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${status.dot} ${status.pulse ? 'animate-pulse' : ''}`}
                />
                <span className={`text-xs font-medium ${status.color}`}>
                  {project.statusLabel}
                </span>
              </div>
              {project.metrics && (
                <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
                  {project.metrics}
                </span>
              )}
              <div className="flex gap-1.5 ml-auto">
                {project.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] text-muted-foreground bg-secondary rounded px-1.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    </>
  );
};

export default ProjectsPage;
