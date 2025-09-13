import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ConversationProps {
  systemPrompt?: string;
  initialUserPrompt?: string;
}

export default function Conversation({ systemPrompt, initialUserPrompt }: ConversationProps) {
  const [input, setInput] = useState('');
  const [conversationStarted, setConversationStarted] = useState(!initialUserPrompt);

  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      body: { systemPrompt },
    }),
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
            <div className="prose prose-sm dark:prose-invert max-w-none">&ldquo;{initialUserPrompt}&rdquo;</div>
          </div>
        )}
        <button
          type="button"
          onClick={handleStartConversation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Start Conversation
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[500px] w-full">
      <div className="flex-1 overflow-y-auto p-6 border-r border-zinc-200 dark:border-zinc-800">
        <div className="max-w-2xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 p-4 rounded-lg ${
                message.role === 'user' ? 'bg-blue-50 dark:bg-blue-950 ml-8' : 'bg-gray-50 dark:bg-gray-900 mr-8'
              }`}
            >
              <div className="font-semibold mb-1">{message.role === 'user' ? 'You' : 'Assistant'}</div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {message.parts.map((part, i) => {
                  if (part.type === 'text') {
                    return <ReactMarkdown key={`${message.id}-${i}`}>{part.text}</ReactMarkdown>;
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/3 min-w-[300px] max-w-md p-6 flex flex-col justify-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage({ text: input });
            setInput('');
          }}
          className="space-y-4"
        >
          <textarea
            className="dark:bg-zinc-900 w-full p-4 border border-zinc-300 dark:border-zinc-800 rounded-lg shadow-sm resize-none h-32"
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput('');
                }
              }
            }}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={!input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
