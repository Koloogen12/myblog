import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight, X, GripVertical, ArrowUp, ArrowDown, ExternalLink, Check, Loader2 } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  SECTION_TEMPLATES, getSectionPlaceholder,
  formatWeekRangeWithYear, getWeeksList, getSprintWordCount, getReadingTime, genId,
  type SprintBullet, type SprintSection,
} from '@/lib/sprint-data';
import { useProjects } from '@/hooks/useProjects';
import { useSprint, useCreateSprint, useUpdateSprint } from '@/hooks/useSprints';
import { ProjectIcon } from '@/components/admin/ProjectIcons';
import { toast } from 'sonner';

const BULLET_PLACEHOLDERS = [
  'выручка за сентябрь 2 417k, растём с июня: май 1 096k → сент 2 417k',
  'усилили команду: junior-продакты, JMM, главный редактор',
  'поняли, что не коммуницируем non-profit статус — исправляемся',
];

const SprintEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const weeks = getWeeksList();

  const { data: allProjects = [], isLoading: projectsLoading } = useProjects();
  const { data: existingSprint, isLoading: sprintLoading } = useSprint(id || '');
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();

  const isEditing = !!id;
  const isLoading = projectsLoading || (isEditing && sprintLoading);

  const [initialized, setInitialized] = useState(false);

  const initialProjectId = searchParams.get('project') || allProjects[0]?.id || '';
  const initialWeekStart = searchParams.get('week') || weeks[0]?.weekStart || '';
  const initialWeekIdx = weeks.findIndex(w => w.weekStart === initialWeekStart);

  const [projectId, setProjectId] = useState(initialProjectId);
  const [weekIndex, setWeekIndex] = useState(Math.max(0, initialWeekIdx));
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [intro, setIntro] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [bullets, setBullets] = useState<SprintBullet[]>([
    { id: genId(), text: '' },
    { id: genId(), text: '' },
    { id: genId(), text: '' },
  ]);
  const [sections, setSections] = useState<SprintSection[]>([]);
  const [customSectionName, setCustomSectionName] = useState('');
  const [showCustomSection, setShowCustomSection] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);

  // Populate form when existing sprint loads
  useEffect(() => {
    if (existingSprint && !initialized) {
      setProjectId(existingSprint.project_id);
      const weekIdx = weeks.findIndex(w => w.weekStart === existingSprint.week_start);
      if (weekIdx >= 0) setWeekIndex(weekIdx);
      setMetrics(existingSprint.metrics || {});
      setIntro(existingSprint.intro || '');
      setShowIntro(existingSprint.show_intro ?? true);
      setBullets(existingSprint.bullets?.length ? existingSprint.bullets : [
        { id: genId(), text: '' },
        { id: genId(), text: '' },
        { id: genId(), text: '' },
      ]);
      setSections(existingSprint.sections || []);
      setInitialized(true);
    }
  }, [existingSprint, initialized, weeks]);

  // Set initial project when projects load and no existing sprint
  useEffect(() => {
    if (!isEditing && allProjects.length > 0 && !projectId) {
      setProjectId(searchParams.get('project') || allProjects[0]?.id || '');
    }
  }, [allProjects, isEditing, projectId, searchParams]);

  const currentWeek = weeks[weekIndex];
  const project = allProjects.find(p => p.id === projectId);
  const enabledMetrics = project?.metrics?.filter(m => m.enabled) || [];

  // Bullet management
  const updateBullet = (bulletId: string, text: string) => {
    setBullets(prev => prev.map(b => b.id === bulletId ? { ...b, text } : b));
  };

  const removeBullet = (bulletId: string) => {
    setBullets(prev => prev.filter(b => b.id !== bulletId));
  };

  const addBullet = (afterId?: string) => {
    if (bullets.length >= 12) return;
    const newBullet = { id: genId(), text: '' };
    if (afterId) {
      setBullets(prev => {
        const idx = prev.findIndex(b => b.id === afterId);
        const next = [...prev];
        next.splice(idx + 1, 0, newBullet);
        return next;
      });
    } else {
      setBullets(prev => [...prev, newBullet]);
    }
  };

  const handleBulletKeyDown = (e: React.KeyboardEvent, bulletId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBullet(bulletId);
    }
    if (e.key === 'Backspace' && bullets.find(b => b.id === bulletId)?.text === '' && bullets.length > 1) {
      e.preventDefault();
      removeBullet(bulletId);
    }
  };

  // Section management
  const addSection = (title: string) => {
    setSections(prev => [...prev, { id: genId(), title, content: '' }]);
  };

  const removeSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    setSections(prev => prev.filter(s => s.id !== sectionId));
    if (section) {
      toast('Раздел удалён', {
        action: { label: 'Отменить', onClick: () => setSections(prev => [...prev, section]) },
      });
    }
  };

  const updateSection = (sectionId: string, field: 'title' | 'content', value: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, [field]: value } : s));
  };

  const moveSection = (sectionId: string, dir: -1 | 1) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === sectionId);
      if ((dir === -1 && idx === 0) || (dir === 1 && idx === prev.length - 1)) return prev;
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next;
    });
  };

  const updateMetric = (metricId: string, value: string) => {
    setMetrics(prev => ({ ...prev, [metricId]: Number(value) || 0 }));
  };

  // Stats
  const sprintData = useMemo(() => ({ intro, bullets, sections }), [intro, bullets, sections]);
  const wordCount = useMemo(() => getSprintWordCount(sprintData), [sprintData]);
  const readTime = useMemo(() => getReadingTime(wordCount), [wordCount]);

  const isSaving = createSprint.isPending || updateSprint.isPending;

  const handleSave = async (publish: boolean) => {
    if (!projectId || !currentWeek) return;
    const sprintPayload = {
      project_id: projectId,
      week_start: currentWeek.weekStart,
      week_end: currentWeek.weekEnd,
      status: publish ? 'published' as const : 'draft' as const,
      metrics,
      intro,
      show_intro: showIntro,
      bullets,
      sections,
    };
    try {
      if (isEditing && id) {
        await updateSprint.mutateAsync({ id, ...sprintPayload });
        toast.success(publish ? 'Опубликовано' : 'Черновик сохранён');
      } else {
        const created = await createSprint.mutateAsync(sprintPayload);
        toast.success(publish ? 'Опубликовано' : 'Черновик сохранён');
        navigate(`/admin/sprints/${created.id}`, { replace: true });
      }
    } catch {
      toast.error('Ошибка при сохранении');
    }
  };

  // Preview component
  const PreviewPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Предпросмотр поста</p>
        <button
          onClick={() => {
            // Build HTML content from sprint data
            const parts: string[] = [];
            if (showIntro && intro) {
              parts.push(`<p>${intro.replace(/\n/g, '<br>')}</p>`);
            }
            if (bullets.some(b => b.text)) {
              parts.push('<h2>Главное</h2>');
              parts.push('<ul>' + bullets.filter(b => b.text).map(b => `<li>${b.text}</li>`).join('') + '</ul>');
            }
            for (const s of sections.filter(s => s.content)) {
              parts.push(`<h2>${s.title}</h2>`);
              parts.push(`<p>${s.content.replace(/\n/g, '<br>')}</p>`);
            }
            const sprintTitle = `${project?.name}: Спринт ${currentWeek ? formatWeekRangeWithYear(currentWeek.weekStart, currentWeek.weekEnd) : ''}`;
            navigate('/admin/posts/new', {
              state: {
                fromSprint: true,
                title: sprintTitle,
                contentHtml: parts.join(''),
                excerpt: bullets.filter(b => b.text).map(b => b.text).join('. '),
              },
            });
          }}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Открыть в редакторе <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="border border-border rounded-lg p-6 space-y-4 text-sm leading-relaxed">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Спринты • {currentWeek ? formatWeekRangeWithYear(currentWeek.weekStart, currentWeek.weekEnd) : ''}
          </p>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {project && <ProjectIcon iconKey={project.icon} size={18} className="text-foreground" />}
            {project?.name}: Спринт
          </h2>
        </div>

        {/* Metrics row */}
        {enabledMetrics.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {enabledMetrics.map(m => `${metrics[m.id] || 0} ${m.label.toLowerCase()}`).join(' • ')}
          </p>
        )}

        {/* Intro */}
        {showIntro && intro && (
          <div className="text-foreground/90 whitespace-pre-wrap">{intro}</div>
        )}

        {/* Bullets */}
        {bullets.some(b => b.text) && (
          <div>
            <h3 className="font-semibold mb-2">Главное</h3>
            <ul className="space-y-1">
              {bullets.filter(b => b.text).map(b => (
                <li key={b.id} className="flex gap-2">
                  <span className="text-primary flex-shrink-0">•</span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections */}
        {sections.filter(s => s.content).map(s => (
          <div key={s.id}>
            <h3 className="font-semibold mb-2">{s.title}</h3>
            <div className="text-foreground/90 whitespace-pre-wrap">{s.content}</div>
          </div>
        ))}

        {wordCount === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Начните писать, чтобы увидеть предпросмотр
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        ~{wordCount} слов • ~{readTime} мин чтения • {sections.length} разделов
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const editorContent = (
    <div className="space-y-8">
      {/* BLOCK 1: Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wide text-muted-foreground">Метрики</h2>
          <button
            onClick={() => navigate('/admin/projects')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Настроить метрики →
          </button>
        </div>
        <div className="flex gap-3 p-3 bg-card border border-border rounded-lg">
          {enabledMetrics.map(m => (
            <div key={m.id} className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">{m.label}</label>
              <Input
                type="number"
                placeholder="0"
                value={metrics[m.id] || ''}
                onChange={e => updateMetric(m.id, e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* BLOCK 2: Intro */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Вступление</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Показать в посте</span>
            <Switch checked={showIntro} onCheckedChange={setShowIntro} />
          </div>
        </div>
        <textarea
          value={intro}
          onChange={e => setIntro(e.target.value)}
          rows={6}
          placeholder={`Напишите вступление. Это может быть:\n- Контекст и миссия — почему делаете то что делаете\n- Или просто «Привет» + общий тон недели\n- Или пропустите — иногда лучше сразу к делу\n\nЭтот раздел читают в первую очередь.`}
          className="w-full bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/50 resize-none focus:outline-none border-b border-border/50 pb-4"
        />
      </div>

      {/* BLOCK 3: Key highlights */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Главное</h2>
          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">★ Ключевой раздел</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Читатели часто читают только этот раздел. 5–10 коротких фактов.
        </p>
        <div className="space-y-1">
          {bullets.map((bullet, i) => (
            <div key={bullet.id} className="flex items-center gap-2 group">
              <GripVertical className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
              <span className="text-primary font-bold flex-shrink-0">•</span>
              <input
                type="text"
                value={bullet.text}
                onChange={e => updateBullet(bullet.id, e.target.value)}
                onKeyDown={e => handleBulletKeyDown(e, bullet.id)}
                placeholder={BULLET_PLACEHOLDERS[i] || 'Новый пункт'}
                className="flex-1 bg-transparent text-sm py-1.5 border-b border-transparent hover:border-border/50 focus:border-border focus:outline-none placeholder:text-muted-foreground/30 transition-colors"
              />
              <button
                onClick={() => removeBullet(bullet.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        {bullets.length < 12 && (
          <button
            onClick={() => addBullet()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            + Добавить пункт
          </button>
        )}
      </div>

      {/* BLOCK 4: Dynamic sections */}
      {sections.map((section, idx) => (
        <div key={section.id} className="space-y-3">
          <div className="flex items-center gap-2 group">
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30" />
            <div className="flex-1 flex items-center gap-2 border-l-2 border-primary/40 pl-3">
              <input
                type="text"
                value={section.title}
                onChange={e => updateSection(section.id, 'title', e.target.value)}
                className="bg-transparent font-semibold text-sm focus:outline-none flex-1"
                placeholder="Название раздела"
              />
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSection(section.id, -1)} disabled={idx === 0}>
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSection(section.id, 1)} disabled={idx === sections.length - 1}>
                <ArrowDown className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeSection(section.id)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <textarea
            value={section.content}
            onChange={e => updateSection(section.id, 'content', e.target.value)}
            rows={6}
            placeholder={getSectionPlaceholder(section.title)}
            className="w-full bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/30 resize-none focus:outline-none border-b border-border/30 pb-4 pl-5"
          />
        </div>
      ))}

      {/* Add section area */}
      <div className="space-y-3 pt-2">
        <p className="text-xs text-muted-foreground">Добавить раздел</p>
        <div className="flex flex-wrap gap-1.5">
          {SECTION_TEMPLATES.map(t => {
            const alreadyAdded = sections.some(s => s.title === t.title);
            return (
              <button
                key={t.title}
                onClick={() => !alreadyAdded && addSection(t.title)}
                disabled={alreadyAdded}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  alreadyAdded
                    ? 'border-border/30 text-muted-foreground/30 cursor-not-allowed'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                + {t.title}
              </button>
            );
          })}
          {showCustomSection ? (
            <div className="flex items-center gap-1">
              <Input
                value={customSectionName}
                onChange={e => setCustomSectionName(e.target.value)}
                placeholder="Название раздела"
                className="h-7 text-xs w-36"
                onKeyDown={e => {
                  if (e.key === 'Enter' && customSectionName.trim()) {
                    addSection(customSectionName.trim());
                    setCustomSectionName('');
                    setShowCustomSection(false);
                  }
                }}
                autoFocus
              />
              <Button size="sm" className="h-7 text-xs" onClick={() => {
                if (customSectionName.trim()) {
                  addSection(customSectionName.trim());
                  setCustomSectionName('');
                  setShowCustomSection(false);
                }
              }}>
                <Check className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomSection(true)}
              className="text-xs px-2.5 py-1 rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              + Свой раздел...
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Sticky top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/sprints')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Спринты
          </button>

          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-auto h-8 text-sm gap-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allProjects.filter(p => p.status !== 'archive').map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="inline-flex items-center gap-1.5">
                    <ProjectIcon iconKey={p.icon} size={14} />
                    {p.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={weekIndex >= weeks.length - 1} onClick={() => setWeekIndex(i => i + 1)}>
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <span className="whitespace-nowrap text-xs">
              {currentWeek ? formatWeekRangeWithYear(currentWeek.weekStart, currentWeek.weekEnd) : '—'}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" disabled={weekIndex <= 0} onClick={() => setWeekIndex(i => i - 1)}>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile preview toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-xs"
            onClick={() => setMobilePreview(!mobilePreview)}
          >
            {mobilePreview ? 'Редактор' : 'Предпросмотр'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={isSaving}
            onClick={() => handleSave(false)}
          >
            {isSaving && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
            Сохранить черновик
          </Button>
          <Button
            size="sm"
            className="text-xs"
            disabled={isSaving}
            onClick={() => handleSave(true)}
          >
            {isSaving && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
            Опубликовать
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Editor */}
        <div className={`lg:col-span-7 ${mobilePreview ? 'hidden lg:block' : ''}`}>
          {editorContent}
        </div>

        {/* Right: Preview */}
        <div className={`lg:col-span-5 ${!mobilePreview ? 'hidden lg:block' : ''}`}>
          <div className="sticky top-0">
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintEditor;
