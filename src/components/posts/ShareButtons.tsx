import { Share2, Send, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const { toast } = useToast();
  const fullUrl = `https://dkochnev.com${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({ title: 'Ссылка скопирована', description: 'Можно вставить куда угодно' });
    } catch {
      toast({ title: 'Не удалось скопировать', variant: 'destructive' });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">Поделиться:</span>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        asChild
      >
        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Поделиться в Telegram"
        >
          <Send className="w-3.5 h-3.5" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        asChild
      >
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Поделиться в LinkedIn"
        >
          <Linkedin className="w-3.5 h-3.5" />
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        asChild
      >
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Поделиться в X"
        >
          <span className="text-xs font-bold">𝕏</span>
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleCopyLink}
        aria-label="Скопировать ссылку"
      >
        <Share2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export default ShareButtons;
