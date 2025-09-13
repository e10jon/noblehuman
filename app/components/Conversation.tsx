import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

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
      <div className="flex flex-col w-full max-w-md py-24 mx-auto">
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
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            if (part.type === 'text') {
              return <span key={`${message.id}-${i}`}>{part.text}</span>;
            }
            return null;
          })}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="dark:bg-zinc-900 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}
