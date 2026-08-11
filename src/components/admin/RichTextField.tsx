import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';

import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Bold,
  Italic,
  Underline,
  Quote,
  List,
  ListOrdered,
  Minus,
  Image as ImageIcon,
  Link2,
  Heading3,
} from 'lucide-react';

import ImageUploadDialog from '@/components/admin/editor/ImageUploadDialog';
import LinkDialog from '@/components/admin/editor/LinkDialog';
import '@/components/admin/editor/editor-styles.css';

interface RichTextFieldProps {
  /** Stored HTML (or legacy plain text — auto-converted to paragraphs). */
  value: string;
  /** Called with HTML on every edit. */
  onChange: (html: string) => void;
  placeholder?: string;
  /** Minimum content height (default 180px — compact). */
  minHeight?: number;
}

const HTML_DETECT = /<\/?(p|h[1-6]|ul|ol|li|blockquote|hr|br|strong|em|u|a|img|figure|table)\b/i;

/** Legacy plain text → HTML: split on blank lines, wrap each in <p>. */
function plainTextToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\n/g, '<br>').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`)
    .join('');
}

const Btn = ({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          variant="ghost"
          pressed={active}
          onPressedChange={onClick}
          aria-label={label}
          className="h-7 w-7 p-0"
        >
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const Toolbar = ({
  editor,
  onImageClick,
  onLinkClick,
}: {
  editor: Editor | null;
  onImageClick: () => void;
  onLinkClick: () => void;
}) => {
  if (!editor) return null;
  return (
    <div className="border-b border-border py-1 px-1 flex items-center gap-0.5 flex-wrap bg-muted/30">
      <Btn
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        label="Подзаголовок"
      >
        <Heading3 className="w-3.5 h-3.5" />
      </Btn>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Btn
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Жирный"
      >
        <Bold className="w-3.5 h-3.5" />
      </Btn>
      <Btn
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Курсив"
      >
        <Italic className="w-3.5 h-3.5" />
      </Btn>
      <Btn
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        label="Подчёркнутый"
      >
        <Underline className="w-3.5 h-3.5" />
      </Btn>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Btn
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Маркированный список"
      >
        <List className="w-3.5 h-3.5" />
      </Btn>
      <Btn
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Нумерованный список"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </Btn>
      <Btn
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label="Цитата"
      >
        <Quote className="w-3.5 h-3.5" />
      </Btn>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Btn
        active={false}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        label="Разделитель"
      >
        <Minus className="w-3.5 h-3.5" />
      </Btn>
      <Btn
        active={editor.isActive('link')}
        onClick={onLinkClick}
        label="Ссылка"
      >
        <Link2 className="w-3.5 h-3.5" />
      </Btn>
      <Btn active={false} onClick={onImageClick} label="Изображение">
        <ImageIcon className="w-3.5 h-3.5" />
      </Btn>
    </div>
  );
};

export const RichTextField = ({
  value,
  onChange,
  placeholder = 'Начни писать…',
  minHeight = 180,
}: RichTextFieldProps) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  // We only push value → editor on first mount. After that, the editor is
  // the source of truth — pushing value back in on every keystroke would
  // reset the caret position.
  const initialContent = useRef(
    value && !HTML_DETECT.test(value) ? plainTextToHtml(value) : value || '',
  ).current;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      UnderlineExtension,
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      // TipTap returns `<p></p>` for an empty doc — normalise to '' so a
      // cleared field saves as truly empty.
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror',
        style: `outline: none; min-height: ${minHeight}px;`,
      },
    },
  });

  // External value reset (e.g. user reloads form). Keep TipTap in sync only
  // when value diverges substantially from the editor's current HTML.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming =
      value && !HTML_DETECT.test(value) ? plainTextToHtml(value) : value || '';
    if (incoming && incoming !== current && !editor.isFocused) {
      editor.commands.setContent(incoming, false);
    }
  }, [value, editor]);

  const handleImageInsert = useCallback(
    (url: string, alt?: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: url, alt: alt ?? '' }).run();
    },
    [editor],
  );

  const handleLinkInsert = useCallback(
    (url: string) => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      if (from === to) {
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    },
    [editor],
  );

  const currentLinkUrl = editor?.getAttributes('link')?.href ?? '';

  return (
    <div className="flex flex-col border border-input rounded-md bg-background overflow-hidden">
      <Toolbar
        editor={editor}
        onImageClick={() => setImageDialogOpen(true)}
        onLinkClick={() => setLinkDialogOpen(true)}
      />
      <EditorContent
        editor={editor}
        className="tiptap prose prose-sm max-w-none px-3 py-2 dark:prose-invert prose-p:my-2 prose-headings:my-3 prose-img:my-3 prose-blockquote:my-3 prose-ul:my-2 prose-ol:my-2 prose-hr:my-4"
      />
      <ImageUploadDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsert={handleImageInsert}
      />
      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onInsert={handleLinkInsert}
        initialUrl={currentLinkUrl}
      />
    </div>
  );
};

export default RichTextField;
