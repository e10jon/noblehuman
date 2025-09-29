import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ExerciseCompletedPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const availableVariables = [
  { variable: '{{#each exerciseSteps}}', description: 'Loop through exercise steps' },
  { variable: '{{content}}', description: 'Step content (use inside each loop)' },
  { variable: '{{result}}', description: 'Step result (use inside each loop)' },
  { variable: '{{/each}}', description: 'End each loop' },
];

export default function ExerciseCompletedPromptEditor({ value, onChange }: ExerciseCompletedPromptEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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
          <CardTitle className="text-lg">Exercise Completed Prompt Template</CardTitle>
          <CardDescription>
            Create a prompt template for exercise completion using Handlebars syntax. Click variables below to insert
            them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md">
            <EditorContent editor={editor} />
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
