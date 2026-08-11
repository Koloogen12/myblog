import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, ChevronDown, RefreshCw, Sparkles, Target, Scissors, Send, RotateCcw } from 'lucide-react';
import {
  MOCK_CONTENT, CONTENT_TYPE_CONFIG, PLATFORM_CONFIG, STATUS_CONFIG,
  AI_MOCK_DRAFT, AI_MOCK_HOOK, AI_MOCK_SHORT,
  ContentItem, ContentStatus, ContentType, Platform,
} from '@/lib/content-studio-data';

const ContentStudioEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<ContentItem | null>(null);
  const [title, setTitle] = useState('');
  const [masterText, setMasterText] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ContentStatus>('idea');
  const [contentType, setContentType] = useState<ContentType>('post');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformVersions, setPlatformVersions] = useState<Record<string, string>>({});
  const [twitterMode, setTwitterMode] = useState<'single' | 'thread'>('single');
  const [twitterThread, setTwitterThread] = useState<string[]>(['']);
  const [notesOpen, setNotesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiUsed, setAiUsed] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const found = MOCK_CONTENT.find((c) => c.id === id);
    if (found) {
      setItem(found);
      setTitle(found.title);
      setMasterText(found.master_text);
      setNotes(found.notes || '');
      setStatus(found.status);
      setContentType(found.content_type);
      setPlatforms(found.platforms);
      setPlatformVersions(found.platform_versions || {});
      setNotesOpen(!found.master_text && !!found.notes);
    }
  }, [id]);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const handleAiAction = useCallback((action: string) => {
    setAiLoading(action);
    setAiUsed(true);
    setTimeout(() => {
      if (action === 'draft') setMasterText(AI_MOCK_DRAFT);
      else if (action === 'hook') {
        const lines = masterText.split('\n');
        const rest = lines.slice(2).join('\n');
        setMasterText(AI_MOCK_HOOK + '\n' + rest);
      } else if (action === 'short') setMasterText(AI_MOCK_SHORT);
      else if (action === 'adapt') {
        const newVersions: Record<string, string> = {};
        platforms.forEach((p) => {
          if (p !== 'site') {
            const cfg = PLATFORM_CONFIG[p];
            const truncated = masterText.slice(0, cfg.maxChars || 500);
            newVersions[p] = truncated;
          }
        });
        setPlatformVersions((prev) => ({ ...prev, ...newVersions }));
        toast({ title: 'Версии для платформ обновлены' });
      }
      setAiLoading(null);
    }, 1500);
  }, [masterText, platforms]);

  const handleCopyFromMaster = (platform: string) => {
    const cfg = PLATFORM_CONFIG[platform as Platform];
    const text = masterText.slice(0, cfg.maxChars || masterText.length);
    setPlatformVersions((prev) => ({ ...prev, [platform]: text }));
  };

  const charCount = masterText.length;
  const wordCount = masterText.trim() ? masterText.trim().split(/\s+/).length : 0;

  if (!item) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Контент не найден
      </div>
    );
  }

  const activePlatforms = platforms.filter((p) => p !== 'site');

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/content-studio')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Content Studio
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none outline-none text-foreground w-80"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                {(() => { const SIcon = STATUS_CONFIG[status].Icon; return <SIcon className="w-3 h-3" />; })()}
                {STATUS_CONFIG[status].label}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(Object.entries(STATUS_CONFIG) as [ContentStatus, typeof STATUS_CONFIG.idea][]).map(([key, cfg]) => (
                <DropdownMenuItem key={key} onClick={() => setStatus(key)}>
                  {(() => { const SIcon = cfg.Icon; return <><SIcon className="w-3 h-3 inline" /> {cfg.label}</>; })()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">Сохранить черновик</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1">
                Опубликовать <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Опубликовать сейчас</DropdownMenuItem>
              <DropdownMenuItem>Запланировать</DropdownMenuItem>
              <DropdownMenuItem>Сохранить черновик</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL — Master Editor */}
        <div className="w-[55%] border-r border-border overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
            {/* Notes / Thesis */}
            <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                <ChevronDown className={`w-3 h-3 transition-transform ${notesOpen ? '' : '-rotate-90'}`} />
                Тезисы / Заметки
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2">
                <Textarea
                  rows={4}
                  className="text-sm border-border"
                  placeholder="Набросайте ключевые мысли через Enter..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                {notes.trim() && (
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => handleAiAction('draft')}>
                    <Sparkles className="w-3 h-3" /> Написать черновик из тезисов
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Master Text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Мастер-текст</span>
                <span className="text-xs text-muted-foreground">{charCount} символов • {wordCount} слов</span>
              </div>
              {aiLoading && aiLoading !== 'adapt' ? (
                <div className="space-y-3 min-h-[400px]">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={masterText}
                  onChange={(e) => setMasterText(e.target.value)}
                  placeholder="Начните писать или нажмите «Написать черновик»..."
                  className={`w-full min-h-[400px] bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground/50 transition-opacity duration-300 ${aiLoading === null && aiUsed ? 'animate-in fade-in duration-300' : ''}`}
                  style={{ lineHeight: 1.7 }}
                />
              )}
            </div>

            {/* AI Toolbar */}
            <div className="flex flex-wrap gap-1 border-t border-border pt-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => handleAiAction('draft')} disabled={!!aiLoading}>
                    <Sparkles className="w-3 h-3" /> Написать черновик
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI напишет пост на основе темы и тезисов</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => handleAiAction('hook')} disabled={!!aiLoading}>
                    <Target className="w-3 h-3" /> Улучши хук
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Перепишет первые 2 строки чтобы они цепляли</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => handleAiAction('short')} disabled={!!aiLoading}>
                    <Scissors className="w-3 h-3" /> Сделай короче
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Уберёт лишнее, оставит суть</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => handleAiAction('adapt')} disabled={!!aiLoading}>
                    <Send className="w-3 h-3" /> Адаптировать для платформ
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Создаст версии для каждой выбранной платформы</TooltipContent>
              </Tooltip>
              {aiUsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => handleAiAction('draft')} disabled={!!aiLoading}>
                      <RotateCcw className="w-3 h-3" /> Ещё раз
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Попробовать другой вариант</TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Publication Settings */}
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors border-t border-border pt-4 w-full">
                <ChevronDown className={`w-3 h-3 transition-transform ${settingsOpen ? '' : '-rotate-90'}`} />
                Настройки публикации
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Тип контента</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.entries(CONTENT_TYPE_CONFIG) as [ContentType, typeof CONTENT_TYPE_CONFIG.post][]).filter(([k]) => k !== 'link').map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setContentType(key)}
                        className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${contentType === key ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
                      >
                        <cfg.Icon className="w-3 h-3 inline mr-1" /> {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Платформы</label>
                  <div className="space-y-2">
                    {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG.site][]).map(([key, cfg]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-1"><cfg.Icon className="w-3.5 h-3.5" /> {cfg.label}</span>
                        <Switch checked={platforms.includes(key)} onCheckedChange={() => togglePlatform(key)} />
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* RIGHT PANEL — Platform Versions */}
        <div className="w-[45%] overflow-y-auto bg-muted/20">
          <div className="px-5 py-5 space-y-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Версии для платформ</span>

            {activePlatforms.length === 0 && (
              <div className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-6 text-center">
                Включите платформы в настройках слева →
              </div>
            )}

            {activePlatforms.map((platform) => {
              const cfg = PLATFORM_CONFIG[platform];
              const version = platformVersions[platform] || '';
              const isTwitter = platform === 'twitter';

              return (
                <div key={platform} className={`bg-card border border-border rounded-lg overflow-hidden border-l-2 ${cfg.borderColor}`}>
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                    <span className="text-sm font-medium flex items-center gap-1"><cfg.Icon className="w-3.5 h-3.5" /> {cfg.label}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{version.length}/{cfg.maxChars}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => handleCopyFromMaster(platform)} className="p-1 rounded hover:bg-muted transition-colors">
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Скопировать из мастер-текста</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="p-3">
                    {isTwitter && (
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => setTwitterMode('single')}
                          className={`text-[10px] px-2 py-1 rounded ${twitterMode === 'single' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                        >
                          Один твит
                        </button>
                        <button
                          onClick={() => setTwitterMode('thread')}
                          className={`text-[10px] px-2 py-1 rounded ${twitterMode === 'thread' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                        >
                          Тред
                        </button>
                      </div>
                    )}
                    {isTwitter && twitterMode === 'thread' ? (
                      <div className="space-y-2">
                        {twitterThread.map((tweet, idx) => (
                          <div key={idx} className="relative">
                            <Textarea
                              rows={2}
                              className="text-sm pr-12"
                              value={tweet}
                              onChange={(e) => {
                                const next = [...twitterThread];
                                next[idx] = e.target.value;
                                setTwitterThread(next);
                              }}
                              placeholder={`Твит ${idx + 1}...`}
                            />
                            <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">{tweet.length}/280</span>
                          </div>
                        ))}
                        <button
                          onClick={() => setTwitterThread([...twitterThread, ''])}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          + добавить твит
                        </button>
                      </div>
                    ) : (
                      <Textarea
                        rows={4}
                        className="text-sm border-none bg-transparent resize-none"
                        value={version}
                        onChange={(e) => setPlatformVersions((prev) => ({ ...prev, [platform]: e.target.value }))}
                        placeholder={`Текст для ${cfg.label}...`}
                      />
                    )}
                  </div>
                  <div className="px-3 pb-3">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Опубликовать в {cfg.label}
                    </Button>
                  </div>
                </div>
              );
            })}

            {activePlatforms.length > 0 && (
              <Button className="w-full mt-4" size="sm">
                📤 Опубликовать в {activePlatforms.length} платформ{activePlatforms.length === 1 ? 'у' : activePlatforms.length < 5 ? 'ы' : ''}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentStudioEditor;
