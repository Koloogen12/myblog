import { useState, useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HeadingItem {
  level: number;
  text: string;
  pos: number;
}

function extractHeadings(doc: JSONContent): HeadingItem[] {
  const headings: HeadingItem[] = [];
  let pos = 0;

  function walk(node: JSONContent) {
    if (node.type === 'heading' && node.attrs?.level) {
      const text =
        node.content
          ?.map((child) => child.text ?? '')
          .join('') ?? '';
      if (text.trim()) {
        headings.push({
          level: node.attrs.level as number,
          text: text.trim(),
          pos,
        });
      }
    }
    if (node.content) {
      for (const child of node.content) {
        walk(child);
        // Approximate position tracking based on text content length
        pos += (child.text?.length ?? 0) + 1;
      }
    }
  }

  if (doc.content) {
    for (const child of doc.content) {
      walk(child);
      pos += 1;
    }
  }

  return headings;
}

interface OutlinePanelProps {
  editor: Editor | null;
}

const OutlinePanel = ({ editor }: OutlinePanelProps) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  const updateHeadings = useCallback(() => {
    if (!editor) {
      setHeadings([]);
      return;
    }
    const doc = editor.getJSON();
    setHeadings(extractHeadings(doc));
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    updateHeadings();

    editor.on('update', updateHeadings);
    return () => {
      editor.off('update', updateHeadings);
    };
  }, [editor, updateHeadings]);

  const scrollToHeading = (index: number) => {
    if (!editor) return;
    const editorElement = editor.view.dom;
    const selector = 'h2, h3';
    const headingElements = editorElement.querySelectorAll(selector);
    const target = headingElements[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="w-[180px] border-r border-border p-3 shrink-0 hidden lg:block">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Содержание
      </h4>
      <ScrollArea className="h-[calc(100vh-200px)]">
        {headings.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Заголовки появятся здесь
          </p>
        ) : (
          <nav className="space-y-1">
            {headings.map((heading, idx) => (
              <button
                key={`${heading.pos}-${idx}`}
                onClick={() => scrollToHeading(idx)}
                className={`block w-full text-left text-sm truncate rounded px-1.5 py-1 hover:bg-muted transition-colors ${
                  heading.level === 3
                    ? 'pl-4 text-muted-foreground'
                    : 'font-medium'
                }`}
                title={heading.text}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        )}
      </ScrollArea>
    </div>
  );
};

export default OutlinePanel;
