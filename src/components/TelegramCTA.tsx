import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface TelegramCTAProps {
  compact?: boolean;
}

const TelegramCTA = ({ compact }: TelegramCTAProps) => {
  if (compact) {
    return (
      <a
        href="https://t.me/kochnev_blog"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
      >
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Send className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Telegram-канал</p>
          <p className="text-xs text-muted-foreground">Подписаться на @kochnev_blog</p>
        </div>
      </a>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 sm:p-10"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Send className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold font-display mb-2">Подпишись на канал</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-md">
          Делюсь мыслями о продуктах, стартапах и принципах быстрее, чем пишу статьи. Без спама, только суть.
        </p>
        <a
          href="https://t.me/kochnev_blog"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <Send className="w-4 h-4" />
          Подписаться в Telegram
        </a>
      </div>
    </motion.section>
  );
};

export default TelegramCTA;
