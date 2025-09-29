import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { forwardRef, useEffect } from 'react';
import { cn } from '~/lib/utils';

interface ResultEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const ResultEditor = forwardRef<HTMLDivElement, ResultEditorProps>(
  ({ value, onChange, className, autoFocus = false }, ref) => {
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [StarterKit],
      content: value || '',
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: cn('prose prose-sm max-w-none focus:outline-none min-h-[100px] px-3 py-2', className),
        },
      },
    });

    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value || '');
      }
    }, [editor, value]);

    useEffect(() => {
      if (editor && autoFocus) {
        // Delay focus to ensure DOM is ready
        const timer = setTimeout(() => {
          editor.commands.focus();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [editor, autoFocus]);

    if (!editor) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'border border-gray-300 relative rounded-md bg-white',
          'focus-within:ring-1 focus-within:ring-indigo-500'
        )}
      >
        <EditorContent editor={editor} />
      </div>
    );
  }
);

ResultEditor.displayName = 'ResultEditor';

export { ResultEditor };
