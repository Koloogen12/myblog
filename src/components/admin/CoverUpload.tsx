import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { uploadCoverImage } from '@/lib/storage';
import { toast } from 'sonner';

interface CoverUploadProps {
  coverUrl: string;
  onCoverChange: (url: string) => void;
}

const CoverUpload = ({ coverUrl, onCoverChange }: CoverUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadCoverImage(file);
      onCoverChange(url);
      toast.success('Обложка загружена');
    } catch (error: any) {
      toast.error('Ошибка загрузки: ' + (error.message || 'неизвестная ошибка'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onCoverChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  if (coverUrl) {
    return (
      <div className="relative inline-block">
        <img src={coverUrl} alt="Cover" className="w-24 h-24 rounded-md object-cover border border-border" />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer w-full flex flex-col items-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Загрузка...
          </>
        ) : (
          <>
            <ImagePlus className="w-5 h-5" />
            Загрузить обложку
          </>
        )}
      </button>
    </div>
  );
};

export default CoverUpload;
