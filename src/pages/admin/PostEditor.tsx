import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
// Category is now a dynamic string from the categories table
import { usePostById, useCreatePost, useUpdatePost } from '@/hooks/usePosts';
import CrossPostSection, { type CrossPostData } from '@/components/admin/CrossPostSection';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

import TipTapEditor from '@/components/admin/editor/TipTapEditor';
import OutlinePanel from '@/components/admin/editor/OutlinePanel';
import MetadataSidebar from '@/components/admin/editor/MetadataSidebar';
import { useAutoSave } from '@/hooks/useAutoSave';
import type { Editor } from '@tiptap/react';

import '@/components/admin/editor/editor-styles.css';

const transliterate = (str: string): string => {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i',
    'й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
    'у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'',
    'э':'e','ю':'yu','я':'ya',' ':'-',
  };
  return str.toLowerCase().split('').map(c => map[c] ?? c).join('').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = !!id;
  const sprintState = (location.state as { fromSprint?: boolean; title?: string; contentHtml?: string; excerpt?: string }) || {};

  const { data: existingPost, isLoading: isLoadingPost } = usePostById(id || '');
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<string>('thoughts');
  const [rating, setRating] = useState(0);
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const editorRef = useRef<Editor | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(1);
  const postIdRef = useRef<string | undefined>(id);

  const [crossPost, setCrossPost] = useState<CrossPostData>({
    telegram: { enabled: false, text: '', parseMode: 'Markdown', disablePreview: false },
    threads: { enabled: false, text: '' },
    linkedin: { enabled: false, text: '', title: '' },
  });

  // Populate form when existing post loads
  useEffect(() => {
    if (existingPost && !initialized) {
      setTitle(existingPost.title || '');
      setSlug(existingPost.slug || '');
      setExcerpt(existingPost.excerpt || '');
      setCategory(existingPost.category || 'thoughts');
      setRating(existingPost.rating || 0);
      setCoverUrl(existingPost.cover_image_url || '');
      setIsPublished(existingPost.is_published || false);
      setInitialized(true);
    }
  }, [existingPost, initialized]);

  // Populate from sprint data (when coming from "Открыть в редакторе")
  useEffect(() => {
    if (sprintState.fromSprint && !initialized && !isEditing) {
      if (sprintState.title) {
        setTitle(sprintState.title);
        setSlug(transliterate(sprintState.title));
      }
      if (sprintState.excerpt) setExcerpt(sprintState.excerpt);
      setInitialized(true);
    }
  }, [sprintState, initialized, isEditing]);

  // Auto-generate slug for new posts
  useEffect(() => {
    if (!isEditing) {
      setSlug(transliterate(title));
    }
  }, [title, isEditing]);

  // Get initial content for editor
  const getInitialContent = () => {
    // From sprint "Открыть в редакторе"
    if (sprintState.fromSprint && sprintState.contentHtml) {
      return sprintState.contentHtml;
    }
    if (!existingPost) return undefined;
    if (existingPost.content_json) return existingPost.content_json;
    // Fallback: load markdown content as HTML for old posts
    if (existingPost.content) return existingPost.content;
    return undefined;
  };

  const handleEditorUpdate = useCallback((editor: Editor) => {
    editorRef.current = editor;
    setEditorReady(true);
    const words = editor.storage.characterCount?.words() || 0;
    setWordCount(words);
    setReadingTime(Math.max(1, Math.round(words / 200)));
    autoSaveControls.markDirty();
  }, []);

  // Save logic
  const savePost = useCallback(async (publish?: boolean) => {
    const editor = editorRef.current;
    if (!editor) throw new Error('Редактор не инициализирован');
    if (!title.trim()) throw new Error('Введите заголовок');

    const shouldPublish = publish !== undefined ? publish : isPublished;
    const postData = {
      title,
      slug,
      content: editor.getText(),
      content_json: editor.getJSON() as Record<string, unknown>,
      content_html: editor.getHTML(),
      excerpt: excerpt || undefined,
      cover_image_url: coverUrl || undefined,
      category,
      rating: category === 'books' && rating ? rating : undefined,
      reading_time: readingTime,
      is_published: shouldPublish,
      published_at: shouldPublish ? new Date().toISOString() : undefined,
    };

    try {
      if (isEditing && postIdRef.current) {
        await updatePost.mutateAsync({ id: postIdRef.current, ...postData });
      } else {
        const created = await createPost.mutateAsync(postData);
        postIdRef.current = created.id;
        navigate(`/admin/posts/${created.id}/edit`, { replace: true });
      }
    } catch {
      throw new Error('Ошибка при сохранении');
    }
  }, [title, slug, excerpt, coverUrl, category, rating, readingTime, isPublished, isEditing, navigate, createPost, updatePost]);

  // Auto-save
  const autoSaveControls = useAutoSave({
    onSave: async () => {
      await savePost();
    },
    enabled: isEditing || !!postIdRef.current,
    intervalMs: 30000,
  });

  const handleSaveDraft = async () => {
    try {
      await savePost(false);
      toast.success('Черновик сохранён');
    } catch {
      toast.error('Ошибка при сохранении');
    }
  };

  const handlePublish = async () => {
    try {
      await savePost(true);
      setIsPublished(true);
      toast.success('Пост опубликован');
    } catch {
      toast.error('Ошибка при публикации');
    }
  };

  const isSaving = createPost.isPending || updatePost.isPending || autoSaveControls.isSaving;

  if (isEditing && isLoadingPost) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Outline panel */}
      <OutlinePanel editor={editorRef.current} />

      {/* Editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/posts')} className="gap-1 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <div className="flex-1" />
          {isSaving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {autoSaveControls.lastSaved && !isSaving && (
            <span className="text-xs text-muted-foreground">
              Сохранено {autoSaveControls.lastSaved.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Title + Editor */}
        <div className="flex-1 overflow-y-auto px-6 py-6 w-full">
          <Input
            value={title}
            onChange={e => { setTitle(e.target.value); autoSaveControls.markDirty(); }}
            placeholder="Заголовок..."
            className="text-3xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/40 font-display"
          />

          <div className="mt-6">
            <TipTapEditor
              content={getInitialContent()}
              onUpdate={handleEditorUpdate}
            />
          </div>
        </div>
      </div>

      {/* Metadata sidebar */}
      <MetadataSidebar
        slug={slug}
        onSlugChange={(v) => { setSlug(v); autoSaveControls.markDirty(); }}
        excerpt={excerpt}
        onExcerptChange={(v) => { setExcerpt(v); autoSaveControls.markDirty(); }}
        category={category}
        onCategoryChange={(v) => { setCategory(v); autoSaveControls.markDirty(); }}
        rating={rating}
        onRatingChange={(v) => { setRating(v); autoSaveControls.markDirty(); }}
        coverUrl={coverUrl}
        onCoverChange={(v) => { setCoverUrl(v); autoSaveControls.markDirty(); }}
        isPublished={isPublished}
        onPublishedChange={(v) => { setIsPublished(v); autoSaveControls.markDirty(); }}
        readingTime={readingTime}
        wordCount={wordCount}
        lastSaved={autoSaveControls.lastSaved}
        isSaving={isSaving}
        onSave={handleSaveDraft}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default PostEditor;
