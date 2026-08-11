import type { Editor } from '@tiptap/react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  Code,
  List,
  ListOrdered,
  Minus,
  Image,
  Link2,
  Table,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  onImageClick: () => void;
  onLinkClick: () => void;
}

interface ToolbarButtonProps {
  editor: Editor;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ToolbarButton = ({ icon, label, isActive, onClick }: ToolbarButtonProps) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          variant="ghost"
          pressed={isActive}
          onPressedChange={() => onClick()}
          aria-label={label}
        >
          {icon}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const EditorToolbar = ({ editor, onImageClick, onLinkClick }: EditorToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="border-b border-border py-1 px-2 flex items-center gap-0.5 flex-wrap">
      {/* Group 1: Headings */}
      <ToolbarButton
        editor={editor}
        icon={<Heading2 className="w-4 h-4" />}
        label="Заголовок 2"
        isActive={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        editor={editor}
        icon={<Heading3 className="w-4 h-4" />}
        label="Заголовок 3"
        isActive={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Group 2: Inline formatting */}
      <ToolbarButton
        editor={editor}
        icon={<Bold className="w-4 h-4" />}
        label="Жирный"
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        editor={editor}
        icon={<Italic className="w-4 h-4" />}
        label="Курсив"
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        editor={editor}
        icon={<Underline className="w-4 h-4" />}
        label="Подчёркнутый"
        isActive={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        editor={editor}
        icon={<Strikethrough className="w-4 h-4" />}
        label="Зачёркнутый"
        isActive={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <ToolbarButton
        editor={editor}
        icon={<Code className="w-4 h-4" />}
        label="Код"
        isActive={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Group 3: Block elements */}
      <ToolbarButton
        editor={editor}
        icon={<Quote className="w-4 h-4" />}
        label="Цитата"
        isActive={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarButton
        editor={editor}
        icon={<List className="w-4 h-4" />}
        label="Маркированный список"
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        editor={editor}
        icon={<ListOrdered className="w-4 h-4" />}
        label="Нумерованный список"
        isActive={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        editor={editor}
        icon={<Minus className="w-4 h-4" />}
        label="Горизонтальная линия"
        isActive={false}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Group 4: Media & Table */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="ghost"
              pressed={false}
              onPressedChange={() => onImageClick()}
              aria-label="Изображение"
            >
              <Image className="w-4 h-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Изображение
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              variant="ghost"
              pressed={editor.isActive('link')}
              onPressedChange={() => onLinkClick()}
              aria-label="Ссылка"
            >
              <Link2 className="w-4 h-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Ссылка
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    variant="ghost"
                    pressed={editor.isActive('table')}
                    aria-label="Таблица"
                  >
                    <Table className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Таблица
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            Вставить таблицу 3x3
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
          >
            Добавить строку
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
          >
            Добавить столбец
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
          >
            Удалить строку
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
          >
            Удалить столбец
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
          >
            Удалить таблицу
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EditorToolbar;
