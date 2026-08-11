import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const MediaLibrary = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Медиатека</h1>
        <Button size="sm" className="gap-1">
          <Upload className="w-4 h-4" /> Загрузить
        </Button>
      </div>

      <div className="border border-dashed border-border rounded-lg p-16 text-center">
        <p className="text-muted-foreground mb-2">Медиатека будет доступна после подключения Lovable Cloud</p>
        <p className="text-sm text-muted-foreground">Здесь вы сможете загружать изображения и копировать ссылки для Markdown</p>
      </div>
    </div>
  );
};

export default MediaLibrary;
