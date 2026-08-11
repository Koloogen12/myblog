import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  GripVertical, Plus, Trash2, ExternalLink, Link as LinkIcon,
  ChevronDown, ChevronUp, Pencil, Check, X, Eye, EyeOff,
  Globe, FileText, FolderOpen, Activity, Lightbulb, BookOpen,
  MessageCircle, Mail, User, Home, Search, Settings, Star,
  Zap, Heart, Shield, type LucideIcon,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Available icons for nav items
const AVAILABLE_ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: 'Globe', Icon: Globe },
  { name: 'FileText', Icon: FileText },
  { name: 'FolderOpen', Icon: FolderOpen },
  { name: 'Activity', Icon: Activity },
  { name: 'Lightbulb', Icon: Lightbulb },
  { name: 'BookOpen', Icon: BookOpen },
  { name: 'MessageCircle', Icon: MessageCircle },
  { name: 'Mail', Icon: Mail },
  { name: 'User', Icon: User },
  { name: 'Home', Icon: Home },
  { name: 'Search', Icon: Search },
  { name: 'Settings', Icon: Settings },
  { name: 'Star', Icon: Star },
  { name: 'Zap', Icon: Zap },
  { name: 'Heart', Icon: Heart },
  { name: 'Shield', Icon: Shield },
  { name: 'ExternalLink', Icon: ExternalLink },
];

type LinkType = 'internal' | 'external';

interface NavItem {
  id: string;
  label: string;
  url: string;
  linkType: LinkType;
  iconName: string;
  enabled: boolean;
  description: string;
}

const defaultNavItems: NavItem[] = [
  { id: '1', label: 'Блог', url: '/', linkType: 'internal', iconName: 'FileText', enabled: true, description: 'Мысли, принципы, разборы' },
  { id: '2', label: 'От идеи до MVP', url: 'https://charm-penalty-bb9.notion.site/MVP-13e947c1f44280f8a699f785cc89cd15', linkType: 'external', iconName: 'Lightbulb', enabled: true, description: 'Гайд по запуску продукта' },
  { id: '3', label: 'Консультация', url: 'https://qlick.io/ru/widget/kochnev/free-consult/start', linkType: 'external', iconName: 'MessageCircle', enabled: true, description: 'Бесплатная консультация' },
];

const getIcon = (iconName: string): LucideIcon => {
  return AVAILABLE_ICONS.find(i => i.name === iconName)?.Icon ?? Globe;
};

const SettingsSite = () => {
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNavItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState<Omit<NavItem, 'id'>>({
    label: '',
    url: '',
    linkType: 'internal',
    iconName: 'Globe',
    enabled: true,
    description: '',
  });

  const toggleItem = (id: string) => {
    setNavItems(prev => prev.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const updateItem = (id: string, updates: Partial<NavItem>) => {
    setNavItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = (id: string) => {
    setNavItems(prev => prev.filter(item => item.id !== id));
    toast({ title: 'Пункт удалён' });
  };

  const addItem = () => {
    if (!newItem.label.trim() || !newItem.url.trim()) {
      toast({ title: 'Заполните название и URL', variant: 'destructive' });
      return;
    }
    const item: NavItem = {
      ...newItem,
      id: crypto.randomUUID(),
    };
    setNavItems(prev => [...prev, item]);
    setNewItem({ label: '', url: '', linkType: 'internal', iconName: 'Globe', enabled: true, description: '' });
    setShowAddDialog(false);
    toast({ title: 'Пункт добавлен' });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= navItems.length) return;
    const updated = [...navItems];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setNavItems(updated);
  };

  const handleDragStart = (i: number) => setDragIdx(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const updated = [...navItems];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(i, 0, moved);
    setNavItems(updated);
    setDragIdx(i);
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleSave = () => {
    toast({ title: 'Навигация сохранена', description: `${navItems.filter(n => n.enabled).length} активных пунктов` });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold">Навигация сайта</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Управляйте пунктами меню: добавляйте, переименовывайте, меняйте порядок и ссылки.
        </p>
        <Separator className="mt-3" />
      </div>

      {/* Nav items list */}
      <div className="space-y-2">
        {navItems.map((item, i) => {
          const ItemIcon = getIcon(item.iconName);
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              draggable={!isEditing}
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`border border-border rounded-lg bg-card transition-all ${
                !item.enabled ? 'opacity-50' : ''
              } ${dragIdx === i ? 'opacity-70 scale-[0.98]' : ''}`}
            >
              {/* Compact row */}
              <div className="flex items-center gap-3 p-3">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />

                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                  <ItemIcon className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <Input
                      value={item.label}
                      onChange={e => updateItem(item.id, { label: e.target.value })}
                      className="h-7 text-sm font-medium"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{item.label}</span>
                      {item.linkType === 'external' && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.url}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Move buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveItem(i, 'up')}
                    disabled={i === 0}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveItem(i, 'down')}
                    disabled={i === navItems.length - 1}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>

                  {/* Edit toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setEditingId(isEditing ? null : item.id)}
                  >
                    {isEditing ? <Check className="w-3.5 h-3.5 text-primary" /> : <Pencil className="w-3.5 h-3.5" />}
                  </Button>

                  {/* Visibility */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleItem(item.id)}
                  >
                    {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Expanded edit panel */}
              {isEditing && (
                <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">URL / Путь</Label>
                      <Input
                        value={item.url}
                        onChange={e => updateItem(item.id, { url: e.target.value })}
                        placeholder={item.linkType === 'internal' ? '/about' : 'https://...'}
                        className="mt-1 text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Тип ссылки</Label>
                      <Select
                        value={item.linkType}
                        onValueChange={(v: LinkType) => updateItem(item.id, { linkType: v })}
                      >
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">
                            <span className="flex items-center gap-1.5">
                              <LinkIcon className="w-3 h-3" /> Внутренняя
                            </span>
                          </SelectItem>
                          <SelectItem value="external">
                            <span className="flex items-center gap-1.5">
                              <ExternalLink className="w-3 h-3" /> Внешняя
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Иконка</Label>
                      <Select
                        value={item.iconName}
                        onValueChange={v => updateItem(item.id, { iconName: v })}
                      >
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ICONS.map(icon => (
                            <SelectItem key={icon.name} value={icon.name}>
                              <span className="flex items-center gap-1.5">
                                <icon.Icon className="w-3.5 h-3.5" /> {icon.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Описание (подсказка)</Label>
                      <Input
                        value={item.description}
                        onChange={e => updateItem(item.id, { description: e.target.value })}
                        placeholder="Краткое описание"
                        className="mt-1 text-sm h-8"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add button */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full border-dashed gap-2">
            <Plus className="w-4 h-4" /> Добавить пункт меню
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новый пункт навигации</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs">Название</Label>
              <Input
                value={newItem.label}
                onChange={e => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Блог"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">URL</Label>
              <Input
                value={newItem.url}
                onChange={e => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                placeholder={newItem.linkType === 'internal' ? '/about' : 'https://example.com'}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Тип ссылки</Label>
                <Select
                  value={newItem.linkType}
                  onValueChange={(v: LinkType) => setNewItem(prev => ({ ...prev, linkType: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">
                      <span className="flex items-center gap-1.5"><LinkIcon className="w-3 h-3" /> Внутренняя</span>
                    </SelectItem>
                    <SelectItem value="external">
                      <span className="flex items-center gap-1.5"><ExternalLink className="w-3 h-3" /> Внешняя</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Иконка</Label>
                <Select
                  value={newItem.iconName}
                  onValueChange={v => setNewItem(prev => ({ ...prev, iconName: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ICONS.map(icon => (
                      <SelectItem key={icon.name} value={icon.name}>
                        <span className="flex items-center gap-1.5">
                          <icon.Icon className="w-3.5 h-3.5" /> {icon.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Описание</Label>
              <Input
                value={newItem.description}
                onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Краткое описание для подсказки"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>Отмена</Button>
              <Button size="sm" onClick={addItem}>Добавить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview */}
      <div className="border border-border rounded-lg p-4 bg-secondary/30">
        <p className="text-xs text-muted-foreground mb-3 font-medium">Предпросмотр навигации</p>
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold">Данил Кочнев</span>
          <div className="flex items-center gap-4">
            {navItems.filter(n => n.enabled).map(item => {
              const Icon = getIcon(item.iconName);
              return (
                <span key={item.id} className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  {item.label}
                  {item.linkType === 'external' && <ExternalLink className="w-2.5 h-2.5 opacity-50" />}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Порядок строк = порядок пунктов в навигации. Внешние ссылки открываются в новой вкладке.
      </p>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave}>Сохранить навигацию</Button>
      </div>
    </div>
  );
};

export default SettingsSite;
