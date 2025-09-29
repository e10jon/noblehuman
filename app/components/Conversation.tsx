import { useChat } from '@ai-sdk/react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '~/lib/utils';
import { Button } from './ui/button';

interface ConversationProps {
  systemPrompt?: string;
  initialUserPrompt?: string;
  completionStepId?: string;
  initialMessages?: UIMessage[];
}

export default function Conversation({
  systemPrompt,
  initialUserPrompt,
  completionStepId,
  initialMessages = [],
}: ConversationProps) {
  const [conversationStarted, setConversationStarted] = useState(!initialUserPrompt || initialMessages.length > 0);
  const [hasContent, setHasContent] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      prepareSendMessagesRequest({ messages }) {
        const message = messages[messages.length - 1];
        if (!message) throw new Error('No message to send');
        return {
          body: {
            message,
            systemPrompt,
            completionStepId,
          },
        };
      },
    }),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages is required to trigger scroll on new messages
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setHasContent(!!editor.getText().trim());
    },
    editorProps: {
      attributes: {
        class:
          'prose max-w-none focus:outline-none dark:prose-invert min-h-[40px] max-h-[200px] overflow-y-auto py-2 px-4 dark:bg-zinc-900 w-full border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-sm',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          const content = editor?.getText().trim();
          if (content) {
            sendMessage({ text: content });
            editor?.commands.clearContent();
            setHasContent(false);
          }
          return true;
        }
        return false;
      },
    },
  });

  const handleStartConversation = () => {
    setConversationStarted(true);
    if (initialUserPrompt) {
      sendMessage({ text: initialUserPrompt });
    }
  };

  if (!conversationStarted) {
    return (
      <div className="flex flex-col w-full max-w-md py-24 mx-auto space-y-4">
        {initialUserPrompt && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="prose dark:prose-invert max-w-none">&ldquo;{initialUserPrompt}&rdquo;</div>
          </div>
        )}
        <Button
          type="button"
          onClick={handleStartConversation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Start Conversation
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={scrollContainerRef} className="overflow-y-scroll">
        <div className="h-[600px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(`m-4 p-4 rounded-lg`, {
                'bg-blue-50 dark:bg-blue-950 ml-8': message.role === 'user',
                'bg-gray-50 dark:bg-gray-900 mr-8': message.role === 'assistant',
              })}
            >
              <div className="prose dark:prose-invert max-w-none">
                {message.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return <ReactMarkdown key={`${message.id}-${i}`}>{part.text}</ReactMarkdown>;
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
          {(status === 'submitted' || status === 'streaming') && (
            <div className="m-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 mr-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-gray-600 dark:text-gray-400">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const content = editor?.getText().trim();
            if (content) {
              sendMessage({ text: content });
              editor?.commands.clearContent();
              setHasContent(false);
            }
          }}
          className="space-y-2"
        >
          <EditorContent editor={editor} />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={!hasContent}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
