import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Clock, FileText } from 'lucide-react';
import CoverUpload from '@/components/admin/CoverUpload';
import { useCategories } from '@/hooks/useCategories';

interface MetadataSidebarProps {
  slug: string;
  onSlugChange: (v: string) => void;
  excerpt: string;
  onExcerptChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  rating: number;
  onRatingChange: (v: number) => void;
  coverUrl: string;
  onCoverChange: (v: string) => void;
  isPublished: boolean;
  onPublishedChange: (v: boolean) => void;
  readingTime: number;
  wordCount: number;
  lastSaved: Date | null;
  isSaving: boolean;
  onSave: () => void;
  onPublish: () => void;
  /** Extra sections rendered at the bottom of the sidebar (e.g. SEO panel). */
  children?: React.ReactNode;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const MetadataSidebar = ({
  slug,
  onSlugChange,
  excerpt,
  onExcerptChange,
  category,
  onCategoryChange,
  rating,
  onRatingChange,
  coverUrl,
  onCoverChange,
  isPublished,
  onPublishedChange,
  readingTime,
  wordCount,
  lastSaved,
  isSaving,
  onSave,
  onPublish,
  children,
}: MetadataSidebarProps) => {
  const { data: categories = [] } = useCategories();

  return (
    <div className="w-[280px] border-l border-border shrink-0 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Status section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Статус</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="published-switch" className="text-sm">
                {isPublished ? 'Опубликовано' : 'Черновик'}
              </Label>
              <Switch
                id="published-switch"
                checked={isPublished}
                onCheckedChange={onPublishedChange}
              />
            </div>
            {isSaving && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Сохранение...
              </p>
            )}
            {!isSaving && lastSaved && (
              <p className="text-xs text-muted-foreground">
                Сохранено: {formatTime(lastSaved)}
              </p>
            )}
          </div>

          <Separator />

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug-input">Slug</Label>
            <Input
              id="slug-input"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="my-post-slug"
            />
          </div>

          <Separator />

          {/* Category */}
          <div className="space-y-3">
            <Label>Категория</Label>
            <RadioGroup
              value={category}
              onValueChange={(v) => onCategoryChange(v)}
              className="space-y-2"
            >
              {categories.map((cat) => (
                <div key={cat.slug} className="flex items-center space-x-2">
                  <RadioGroupItem value={cat.slug} id={`cat-${cat.slug}`} />
                  <Label htmlFor={`cat-${cat.slug}`} className="text-sm font-normal cursor-pointer">
                    {cat.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Rating (books only) */}
          {category === 'books' && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="rating-input">Рейтинг</Label>
                <Input
                  id="rating-input"
                  type="number"
                  min={1}
                  max={10}
                  value={rating}
                  onChange={(e) => onRatingChange(Number(e.target.value))}
                />
              </div>
            </>
          )}

          <Separator />

          {/* Cover */}
          <div className="space-y-2">
            <Label>Обложка</Label>
            <CoverUpload coverUrl={coverUrl} onCoverChange={onCoverChange} />
          </div>

          <Separator />

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt-textarea">Описание</Label>
            <Textarea
              id="excerpt-textarea"
              value={excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
              placeholder="Краткое описание поста..."
              rows={3}
            />
          </div>

          <Separator />

          {/* Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Инфо</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>~{readingTime} мин</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />
              <span>{wordCount} слов</span>
            </div>
          </div>
        </div>
          {children && (
            <>
              <Separator />
              {children}
            </>
          )}
      </ScrollArea>

      {/* Bottom actions */}
      <div className="border-t border-border p-4 space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            'Сохранить черновик'
          )}
        </Button>
        <Button className="w-full" onClick={onPublish} disabled={isSaving}>
          Опубликовать
        </Button>
      </div>
    </div>
  );
};

export default MetadataSidebar;
