import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type CategoryRow,
} from '@/hooks/useCategories';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, GripVertical, Check, X } from 'lucide-react';

const SettingsCategories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editGroup, setEditGroup] = useState<'synthesize' | 'distill'>('synthesize');

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newGroup, setNewGroup] = useState<'synthesize' | 'distill'>('synthesize');

  const startEdit = (cat: CategoryRow) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditGroup(cat.group_name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditSlug('');
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim() || !editSlug.trim()) return;
    try {
      await updateCat.mutateAsync({
        id: editingId,
        name: editName.trim(),
        slug: editSlug.trim(),
        group_name: editGroup,
      });
      cancelEdit();
      toast({ title: 'Категория обновлена' });
    } catch {
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    try {
      await createCat.mutateAsync({
        name: newName.trim(),
        slug: newSlug.trim(),
        group_name: newGroup,
        sort_order: categories.length,
      });
      setShowNew(false);
      setNewName('');
      setNewSlug('');
      setNewGroup('synthesize');
      toast({ title: 'Категория создана' });
    } catch {
      toast({ title: 'Ошибка создания', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить категорию «${name}»?`)) return;
    try {
      await deleteCat.mutateAsync(id);
      toast({ title: 'Категория удалена' });
    } catch {
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    }
  };

  const autoSlug = (name: string) => {
    const map: Record<string, string> = {
      а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
    };
    return name
      .toLowerCase()
      .split('')
      .map(c => map[c] ?? c)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" /></div>;
  }

  const synthesize = categories.filter(c => c.group_name === 'synthesize');
  const distill = categories.filter(c => c.group_name === 'distill');

  const renderCategory = (cat: CategoryRow) => {
    if (editingId === cat.id) {
      return (
        <div key={cat.id} className="border border-primary/30 rounded-lg p-3 space-y-3 bg-primary/5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Название</Label>
              <Input
                value={editName}
                onChange={e => { setEditName(e.target.value); setEditSlug(autoSlug(e.target.value)); }}
                placeholder="Название"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Slug</Label>
              <Input value={editSlug} onChange={e => setEditSlug(e.target.value)} placeholder="slug" />
            </div>
          </div>
          <RadioGroup value={editGroup} onValueChange={v => setEditGroup(v as 'synthesize' | 'distill')} className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="synthesize" id="edit-syn" />
              <Label htmlFor="edit-syn" className="text-xs cursor-pointer">Синтезирую</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="distill" id="edit-dis" />
              <Label htmlFor="edit-dis" className="text-xs cursor-pointer">Дистиллирую</Label>
            </div>
          </RadioGroup>
          <div className="flex gap-2">
            <Button size="sm" onClick={saveEdit} disabled={updateCat.isPending}>
              <Check className="w-3.5 h-3.5 mr-1" />Сохранить
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelEdit}>
              <X className="w-3.5 h-3.5 mr-1" />Отмена
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div key={cat.id} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-secondary/50 group">
        <GripVertical className="w-4 h-4 text-muted-foreground/50" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{cat.name}</span>
          <span className="text-xs text-muted-foreground ml-2">/{cat.slug}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => startEdit(cat)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="w-7 h-7 text-destructive" onClick={() => handleDelete(cat.id, cat.name)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Категории</h2>
            <p className="text-xs text-muted-foreground mt-1">Управление категориями блога и левым меню</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowNew(true)} disabled={showNew}>
            <Plus className="w-4 h-4 mr-1" />Добавить
          </Button>
        </div>
        <Separator />
      </section>

      {/* New category form */}
      {showNew && (
        <div className="border border-dashed border-primary/30 rounded-lg p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Название</Label>
              <Input
                value={newName}
                onChange={e => { setNewName(e.target.value); setNewSlug(autoSlug(e.target.value)); }}
                placeholder="Например: Продукты"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Slug</Label>
              <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="products" />
            </div>
          </div>
          <RadioGroup value={newGroup} onValueChange={v => setNewGroup(v as 'synthesize' | 'distill')} className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="synthesize" id="new-syn" />
              <Label htmlFor="new-syn" className="text-xs cursor-pointer">Синтезирую</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <RadioGroupItem value="distill" id="new-dis" />
              <Label htmlFor="new-dis" className="text-xs cursor-pointer">Дистиллирую</Label>
            </div>
          </RadioGroup>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={createCat.isPending || !newName.trim()}>
              <Plus className="w-3.5 h-3.5 mr-1" />Создать
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowNew(false); setNewName(''); setNewSlug(''); }}>
              Отмена
            </Button>
          </div>
        </div>
      )}

      {/* Synthesize group */}
      <section className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Синтезирую</p>
        <div className="space-y-0.5">
          {synthesize.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">Нет категорий</p>
          ) : (
            synthesize.map(renderCategory)
          )}
        </div>
      </section>

      {/* Distill group */}
      <section className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Дистиллирую</p>
        <div className="space-y-0.5">
          {distill.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-2">Нет категорий</p>
          ) : (
            distill.map(renderCategory)
          )}
        </div>
      </section>
    </div>
  );
};

export default SettingsCategories;
