import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { forwardRef, useEffect } from 'react';
import { cn } from '~/lib/utils';

interface EditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const Editor = forwardRef<HTMLDivElement, EditorProps>(({ value, onChange, placeholder, className }, ref) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn('prose prose-sm max-w-none focus:outline-none min-h-[60px] px-3 py-2', className),
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div
      ref={ref}
      className="border border-gray-300 relative rounded-md bg-white focus-within:ring-1 focus-within:ring-indigo-500"
    >
      <div className="border-b border-gray-200 p-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            'px-2 py-1.5 rounded-md transition-colors duration-100 hover:bg-gray-100 text-sm font-medium',
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
          )}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            'px-2 py-1.5 rounded-md transition-colors duration-100 hover:bg-gray-100 text-sm font-medium',
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          )}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            'px-2 py-1.5 rounded-md transition-colors duration-100 hover:bg-gray-100 text-sm font-medium',
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
          )}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={cn(
            'px-2 py-1.5 rounded-md transition-colors duration-100 hover:bg-gray-100 text-sm font-medium',
            editor.isActive('heading', { level: 4 }) ? 'bg-gray-200' : ''
          )}
        >
          H4
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'p-2 rounded-md transition-colors duration-100 hover:bg-gray-100',
            editor.isActive('bold') ? 'bg-gray-200' : ''
          )}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'p-2 rounded-md transition-colors duration-100 hover:bg-gray-100',
            editor.isActive('italic') ? 'bg-gray-200' : ''
          )}
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'p-2 rounded-md transition-colors duration-100 hover:bg-gray-100',
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          )}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'p-2 rounded-md transition-colors duration-100 hover:bg-gray-100',
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
      {!editor.getText() && placeholder && (
        <div className="absolute top-[60px] left-3 text-gray-400 pointer-events-none">{placeholder}</div>
      )}
    </div>
  );
});

Editor.displayName = 'Editor';

export { Editor };
