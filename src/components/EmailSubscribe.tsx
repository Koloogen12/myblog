import { useState } from 'react';
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const EmailSubscribe = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert({ email: email.trim().toLowerCase() });

      if (error) {
        if (error.code === '23505') {
          // Unique violation — already subscribed
          setStatus('success');
          return;
        }
        throw error;
      }

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg('Не удалось подписаться. Попробуйте позже.');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-10"
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold font-display mb-2">Email-рассылка</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-md">
          Раз в неделю — лучшие статьи, инсайты из продуктовой работы и полезные ссылки. Без спама.
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            Отлично! Вы подписаны.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Подписаться
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-xs text-destructive mt-2">{errorMsg}</p>
        )}
      </div>
    </motion.section>
  );
};

export default EmailSubscribe;
