import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  formatWeekRangeWithYear, getWeeksList, getSprintWordCount,
} from '@/lib/sprint-data';
import { useSprints, type Sprint } from '@/hooks/useSprints';
import { useProjects, type Project } from '@/hooks/useProjects';
import { ProjectIcon, StatusChip } from '@/components/admin/ProjectIcons';
import { toast } from 'sonner';

const SprintsList = () => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showPublished, setShowPublished] = useState(true);
  const [showDraft, setShowDraft] = useState(true);
  const [showNotFilled, setShowNotFilled] = useState(true);

  const { data: allProjects = [], isLoading: projectsLoading } = useProjects();
  const { data: allSprints = [], isLoading: sprintsLoading } = useSprints();

  const isLoading = projectsLoading || sprintsLoading;

  const weeks = getWeeksList();
  const currentWeek = weeks[0];
  const activeProjects = allProjects.filter(p => p.status !== 'archive');

  const getProject = (id: string) => allProjects.find(p => p.id === id);

  // Generate current week entries (real sprints + not_filled placeholders)
  const currentWeekSprints: (Sprint & { isPlaceholder?: boolean })[] = activeProjects
    .filter(p => selectedProject === 'all' || p.id === selectedProject)
    .map(project => {
      const existing = allSprints.find(
        s => s.project_id === project.id && s.week_start === currentWeek.weekStart
      );
      if (existing) return existing;
      return {
        id: `placeholder-${project.id}`,
        project_id: project.id,
        week_start: currentWeek.weekStart,
        week_end: currentWeek.weekEnd,
        status: 'not_filled' as const,
        metrics: {},
        intro: '',
        show_intro: true,
        bullets: [],
        sections: [],
        created_at: '',
        updated_at: '',
        isPlaceholder: true,
      };
    });

  // Archive sprints
  const archiveSprints = allSprints
    .filter(s => s.week_start !== currentWeek.weekStart)
    .filter(s => selectedProject === 'all' || s.project_id === selectedProject)
    .filter(s => {
      if (s.status === 'published' && !showPublished) return false;
      if (s.status === 'draft' && !showDraft) return false;
      return true;
    })
    .sort((a, b) => b.week_start.localeCompare(a.week_start));

  const filteredCurrent = currentWeekSprints.filter(s => {
    if (s.status === 'published' && !showPublished) return false;
    if (s.status === 'draft' && !showDraft) return false;
    if (s.status === 'not_filled' && !showNotFilled) return false;
    return true;
  });

  const getExcerpt = (sprint: Sprint) => {
    if (sprint.bullets.length > 0) {
      const text = sprint.bullets.map(b => b.text).join('. ');
      return text.length > 80 ? text.slice(0, 80) + '...' : text;
    }
    if (sprint.intro) {
      return sprint.intro.length > 80 ? sprint.intro.slice(0, 80) + '...' : sprint.intro;
    }
    return '';
  };

  const renderSprintCard = (sprint: Sprint & { isPlaceholder?: boolean }) => {
    const project = getProject(sprint.project_id);
    if (!project) return null;
    const excerpt = getExcerpt(sprint);
    const wordCount = getSprintWordCount({ intro: sprint.intro, bullets: sprint.bullets, sections: sprint.sections });

    return (
      <div key={sprint.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 hover:border-primary/30 transition-all group cursor-pointer">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <ProjectIcon iconKey={project.icon} size={14} className="text-muted-foreground shrink-0" />
            <span className="text-sm font-medium truncate">{project.name}</span>
            <StatusChip status={sprint.status} />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatWeekRangeWithYear(sprint.week_start, sprint.week_end)}
          </span>
        </div>
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">"{excerpt}"</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-muted-foreground">
            {wordCount > 0 && <span>{sprint.sections.length} разделов • ~{wordCount} слов</span>}
          </div>
          <div className="flex items-center gap-1">
            {sprint.status === 'not_filled' && (
              <Link to={`/admin/sprints/new?project=${project.id}&week=${sprint.week_start}`}>
                <Button size="sm" variant="outline" className="text-xs h-7">Написать →</Button>
              </Link>
            )}
            {sprint.status === 'draft' && (
              <>
                <Link to={`/admin/sprints/${sprint.id}`}>
                  <Button size="sm" variant="ghost" className="text-xs h-7">Продолжить</Button>
                </Link>
                <Button size="sm" variant="outline" className="text-xs h-7 text-green-500 border-green-500/30 hover:bg-green-500/10"
                  onClick={() => toast.success('Опубликовано')}>
                  Опубликовать
                </Button>
              </>
            )}
            {sprint.status === 'published' && (
              <Link to={`/admin/sprints/${sprint.id}`}>
                <Button size="sm" variant="ghost" className="text-xs h-7">Открыть</Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Дублировать</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Удалить</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Left filter panel */}
      <div className="w-[200px] flex-shrink-0 sticky top-0 self-start space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Фильтр</p>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedProject('all')}
              className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                selectedProject === 'all' ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Все проекты
            </button>
            {activeProjects.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProject(p.id)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                  selectedProject === p.id ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <ProjectIcon iconKey={p.icon} size={13} className="text-muted-foreground" />
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Статус</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={showPublished} onCheckedChange={() => setShowPublished(!showPublished)} />
              <span className="text-sm">Опубликован</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={showDraft} onCheckedChange={() => setShowDraft(!showDraft)} />
              <span className="text-sm">Черновик</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={showNotFilled} onCheckedChange={() => setShowNotFilled(!showNotFilled)} />
              <span className="text-sm">Не заполнен</span>
            </label>
          </div>
        </div>
      </div>

      {/* Right sprint list */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Спринты</h1>
          <Link to="/admin/sprints/new">
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Новый спринт
            </Button>
          </Link>
        </div>

        {/* Current week */}
        {filteredCurrent.length > 0 && (
          <div className="mb-8">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3 sticky top-0 bg-background py-1">
              Текущая неделя
            </p>
            <div className="space-y-2">
              {filteredCurrent.map(renderSprintCard)}
            </div>
          </div>
        )}

        {/* Archive */}
        {archiveSprints.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3 sticky top-0 bg-background py-1">
              Архив
            </p>
            <div className="space-y-2">
              {archiveSprints.map(renderSprintCard)}
            </div>
          </div>
        )}

        {filteredCurrent.length === 0 && archiveSprints.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Нет спринтов по выбранным фильтрам
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintsList;
