import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, MoreHorizontal, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import {
  ICON_PICKER_KEYS, DEFAULT_METRICS,
  type ProjectMetric,
} from '@/lib/sprint-data';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, type Project } from '@/hooks/useProjects';
import { ProjectIcon, PROJECT_ICONS } from '@/components/admin/ProjectIcons';

type ProjectStatus = 'active' | 'pause' | 'archive';

const statusConfig: Record<ProjectStatus, { label: string; dotClass: string }> = {
  active: { label: 'Активный', dotClass: 'bg-green-500' },
  pause: { label: 'Пауза', dotClass: 'bg-yellow-500' },
  archive: { label: 'Архив', dotClass: 'bg-muted-foreground' },
};

const ProjectsList = () => {
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Form state
  const [formIcon, setFormIcon] = useState('rocket');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<ProjectStatus>('active');
  const [formMetrics, setFormMetrics] = useState<ProjectMetric[]>(DEFAULT_METRICS.map(m => ({ ...m })));
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [customMetric, setCustomMetric] = useState('');
  const [showCustomMetric, setShowCustomMetric] = useState(false);

  const activeProjects = projects.filter(p => p.status !== 'archive');
  const archivedProjects = projects.filter(p => p.status === 'archive');

  const openNewProject = () => {
    setEditingProject(null);
    setFormIcon('rocket');
    setFormName('');
    setFormDesc('');
    setFormStatus('active');
    setFormMetrics(DEFAULT_METRICS.map(m => ({ ...m })));
    setShowCustomMetric(false);
    setSheetOpen(true);
  };

  const openEditProject = (project: Project) => {
    setEditingProject(project);
    setFormIcon(project.icon);
    setFormName(project.name);
    setFormDesc(project.description);
    setFormStatus(project.status);
    setFormMetrics((project.metrics || []).map(m => ({ ...m })));
    setShowCustomMetric(false);
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Введите название проекта');
      return;
    }
    try {
      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          icon: formIcon,
          name: formName,
          description: formDesc,
          status: formStatus,
          metrics: formMetrics,
        });
        toast.success('Проект обновлён');
      } else {
        await createProject.mutateAsync({
          icon: formIcon,
          name: formName,
          slug: formName.toLowerCase().replace(/\s+/g, '-'),
          description: formDesc,
          status: formStatus,
          metrics: formMetrics,
        });
        toast.success('Проект создан');
      }
      setSheetOpen(false);
    } catch {
      toast.error('Ошибка при сохранении проекта');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await updateProject.mutateAsync({ id, status: 'archive' });
      toast.success('Проект архивирован');
    } catch {
      toast.error('Ошибка при архивации');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
      toast.success('Проект удалён');
    } catch {
      toast.error('Ошибка при удалении проекта');
    }
  };

  const toggleMetric = (metricId: string) => {
    setFormMetrics(prev => prev.map(m => m.id === metricId ? { ...m, enabled: !m.enabled } : m));
  };

  const addCustomMetric = () => {
    if (!customMetric.trim()) return;
    setFormMetrics(prev => [...prev, { id: `custom-${Date.now()}`, label: customMetric, enabled: true, custom: true }]);
    setCustomMetric('');
    setShowCustomMetric(false);
  };

  const renderProjectRow = (project: Project) => (
    <div key={project.id} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
        <ProjectIcon iconKey={project.icon} size={18} className="text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{project.name}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[project.status].dotClass}`} />
            {statusConfig[project.status].label}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{project.description}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openEditProject(project)}>Редактировать</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleArchive(project.id)}>Архивировать</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(project.id)}>Удалить</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Проекты</h1>
        <Button size="sm" className="gap-1" onClick={openNewProject}>
          <Plus className="w-4 h-4" /> Добавить проект
        </Button>
      </div>

      {/* Active projects */}
      <div className="border border-border rounded-lg overflow-hidden mb-6">
        {activeProjects.map(renderProjectRow)}
        {activeProjects.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">Нет активных проектов</div>
        )}
      </div>

      {/* Archived */}
      {archivedProjects.length > 0 && (
        <Collapsible open={archiveOpen} onOpenChange={setArchiveOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            {archiveOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Архив ({archivedProjects.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border border-border rounded-lg overflow-hidden opacity-60">
              {archivedProjects.map(renderProjectRow)}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingProject ? 'Редактировать проект' : 'Новый проект'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 mt-6">
            {/* Icon picker */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Иконка</Label>
              <div>
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-12 h-12 border border-border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center"
                >
                  <ProjectIcon iconKey={formIcon} size={24} className="text-foreground" />
                </button>
                {showIconPicker && (
                  <div className="mt-2 grid grid-cols-10 gap-1 p-2 border border-border rounded-lg bg-card">
                    {ICON_PICKER_KEYS.map(key => {
                      const IconComp = PROJECT_ICONS[key];
                      return (
                        <button
                          key={key}
                          onClick={() => { setFormIcon(key); setShowIconPicker(false); }}
                          className={`p-1.5 hover:bg-muted rounded transition-colors flex items-center justify-center ${
                            formIcon === key ? 'bg-muted ring-1 ring-primary' : ''
                          }`}
                        >
                          {IconComp && <IconComp size={16} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Название проекта *</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="MakeMeLook" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Описание</Label>
              <Textarea rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Одна строка что это и для кого" />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Статус</Label>
              <div className="flex gap-2">
                {(['active', 'pause', 'archive'] as ProjectStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setFormStatus(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      formStatus === s
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[s].dotClass}`} />
                    {statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Ключевые метрики</Label>
              <p className="text-xs text-muted-foreground">Какие метрики отслеживать в спринтах?</p>
              <div className="space-y-2">
                {formMetrics.map(m => (
                  <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={m.enabled} onCheckedChange={() => toggleMetric(m.id)} />
                    <span className="text-sm">{m.label}</span>
                  </label>
                ))}
              </div>
              {showCustomMetric ? (
                <div className="flex gap-2">
                  <Input
                    value={customMetric}
                    onChange={e => setCustomMetric(e.target.value)}
                    placeholder="Название метрики"
                    className="flex-1"
                    onKeyDown={e => e.key === 'Enter' && addCustomMetric()}
                  />
                  <Button size="sm" onClick={addCustomMetric}>Добавить</Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomMetric(true)}
                  className="text-xs text-primary hover:underline"
                >
                  + Добавить свою метрику
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button variant="ghost" onClick={() => setSheetOpen(false)} className="flex-1">Отмена</Button>
              <Button onClick={handleSave} disabled={createProject.isPending || updateProject.isPending} className="flex-1">
                {(createProject.isPending || updateProject.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Сохранить
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProjectsList;
