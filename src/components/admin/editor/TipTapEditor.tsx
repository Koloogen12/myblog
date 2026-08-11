import { useState, useCallback } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table as TableExtension } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import UnderlineExtension from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

import EditorToolbar from './EditorToolbar';
import ImageUploadDialog from './ImageUploadDialog';
import LinkDialog from './LinkDialog';
import './editor-styles.css';

interface TipTapEditorProps {
  content?: Record<string, unknown> | string;
  onUpdate?: (editor: Editor) => void;
  editable?: boolean;
}

const TipTapEditor = ({ content, onUpdate, editable = true }: TipTapEditorProps) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      TableExtension.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
      UnderlineExtension,
      Placeholder.configure({
        placeholder: 'Начните писать...',
      }),
      CharacterCount,
    ],
    content: content ?? '',
    editable,
    onCreate: ({ editor: ed }) => {
      onUpdate?.(ed as Editor);
    },
    onUpdate: ({ editor: ed }) => {
      onUpdate?.(ed as Editor);
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror',
        style: 'outline: none; min-height: 400px;',
      },
    },
  });

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
        // No selection: insert the URL as linked text
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${url}</a>`)
          .run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    },
    [editor],
  );

  const handleLinkClick = useCallback(() => {
    setLinkDialogOpen(true);
  }, []);

  const currentLinkUrl = editor?.getAttributes('link')?.href ?? '';

  return (
    <div className="flex flex-col border border-border rounded-lg bg-background overflow-hidden">
      {editable && (
        <EditorToolbar
          editor={editor}
          onImageClick={() => setImageDialogOpen(true)}
          onLinkClick={handleLinkClick}
        />
      )}
      <EditorContent
        editor={editor}
        className="tiptap prose prose-sm max-w-none min-h-[400px] p-4"
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

export { TipTapEditor };
export type { TipTapEditorProps };
export default TipTapEditor;
