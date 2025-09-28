import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface SystemPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onPreview?: () => void;
}

const availableVariables = [
  { variable: '{{bio}}', description: 'User bio description' },
  { variable: '{{urls}}', description: 'Comma-separated list of user URLs' },
];

export default function SystemPromptEditor({ value, onChange, onPreview }: SystemPromptEditorProps) {
  const [showVariables, setShowVariables] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  const insertVariable = (variable: string) => {
    if (editor) {
      editor.chain().focus().insertContent(variable).run();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Prompt Template</CardTitle>
          <CardDescription>
            Create a system prompt template using Handlebars syntax. Click variables below to insert them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md">
            <EditorContent editor={editor} />
          </div>

          <div className="flex gap-2 items-center">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowVariables(!showVariables)}>
              {showVariables ? 'Hide' : 'Show'} Variables
            </Button>
            {onPreview && (
              <Button type="button" variant="outline" size="sm" onClick={onPreview}>
                Preview with Sample Data
              </Button>
            )}
          </div>

          {showVariables && (
            <div className="grid grid-cols-1 gap-2 p-4 bg-gray-50 rounded-md">
              <div className="text-sm font-medium text-gray-700 mb-2">Available Variables:</div>
              {availableVariables.map(({ variable, description }) => (
                <div key={variable} className="flex items-center justify-between">
                  <div>
                    <code className="text-sm bg-white px-2 py-1 rounded border">{variable}</code>
                    <span className="text-sm text-gray-600 ml-2">{description}</span>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertVariable(variable)}>
                    Insert
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
