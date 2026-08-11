import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
  intervalMs?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  markDirty: () => void;
}

export function useAutoSave({
  onSave,
  intervalMs = 30000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isDirtyRef = useRef(false);
  const isSavingRef = useRef(false);
  const onSaveRef = useRef(onSave);

  // Keep the callback ref up to date
  onSaveRef.current = onSave;

  const performSave = useCallback(async () => {
    if (!isDirtyRef.current || isSavingRef.current) return;

    isDirtyRef.current = false;
    isSavingRef.current = true;
    setIsSaving(true);

    try {
      await onSaveRef.current();
      setLastSaved(new Date());
    } catch {
      // Re-mark dirty on failure so it retries
      isDirtyRef.current = true;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, []);

  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  // Periodic auto-save
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      performSave();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, intervalMs, performSave]);

  // Cmd+S / Ctrl+S keyboard shortcut
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        performSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, performSave]);

  return { lastSaved, isSaving, markDirty };
}
