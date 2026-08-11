import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadCoverImage } from '@/lib/storage';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (url: string, alt?: string) => void;
}

const ImageUploadDialog = ({ open, onOpenChange, onInsert }: ImageUploadDialogProps) => {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const reset = () => {
    setUrl('');
    setAlt('');
    setIsUploading(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadCoverImage(file);
      setUrl(uploadedUrl);
      toast.success('Изображение загружено');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'неизвестная ошибка';
      toast.error('Ошибка загрузки: ' + message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsert = () => {
    if (!url.trim()) return;
    onInsert(url.trim(), alt.trim() || undefined);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Вставить изображение</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Загрузить</TabsTrigger>
            <TabsTrigger value="url">По ссылке</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Файл</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Загрузка...
                </div>
              )}
              {url && !isUploading && (
                <p className="text-sm text-muted-foreground truncate">
                  {url}
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL изображения</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>
        <div className="space-y-2">
          <Label htmlFor="image-alt">Alt текст</Label>
          <Input
            id="image-alt"
            placeholder="Описание изображения"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleInsert} disabled={!url.trim() || isUploading}>
            Вставить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadDialog;
