import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/storage';

interface ImageFieldProps {
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  /** Hide the URL text input — show only thumbnail + upload/clear buttons. */
  compact?: boolean;
  /** Placeholder for the URL input. */
  placeholder?: string;
}

/**
 * Reusable image upload field.
 * Renders a thumbnail with manual URL input + upload-from-disk button.
 * Used in Linkhub editor and Projects editor.
 */
export const ImageField = ({
  label,
  value,
  onChange,
  compact = false,
  placeholder = 'URL или загрузить →',
}: ImageFieldProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast({ title: 'Изображение загружено' });
    } catch {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        {value ? (
          <>
            <img
              src={value}
              alt=""
              className="w-12 h-12 rounded-lg object-cover border border-border bg-muted/30"
            />
            {!compact && (
              <Input
                value={value}
                onChange={e => onChange(e.target.value)}
                className="flex-1"
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(undefined)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => ref.current?.click()}
              disabled={uploading}
              className="w-12 h-12 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
              aria-label="Загрузить изображение"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {!compact && (
              <Input
                value={value || ''}
                onChange={e => onChange(e.target.value || undefined)}
                placeholder={placeholder}
                className="flex-1"
              />
            )}
          </>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageField;
