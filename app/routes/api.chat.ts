import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import type { User } from '../../prisma/generated/client';
import { requireUser } from '../lib/auth';

export const action = async ({ request }: { request: Request }) => {
  const { messages, systemPrompt }: { messages: UIMessage[]; systemPrompt?: string } = await request.json();

  const user = await requireUser(request);

  const result = streamText({
    model: openai('gpt-4o'),
    system: createCompleteSystemPrompt({ user, supplementalSystemPrompt: systemPrompt }),
    messages: convertToModelMessages(messages),
    tools: {
      web_search: openai.tools.webSearch({}),
    },
  });

  return result.toUIMessageStreamResponse();
};

const createCompleteSystemPrompt = ({
  user,
  supplementalSystemPrompt,
}: {
  user: User;
  supplementalSystemPrompt?: string;
}) => {
  let prompt = 'You are a wise person.';

  if (user.data.bio) {
    prompt += `\n\nYou are speaking with someone who described themselves as this:\n${user.data.bio}.`;
  }

  if (user.data.urls.length > 0) {
    prompt += `\n\nThey have provided the following URLs. Please visit them to learn more about them:\n${user.data.urls.map((url) => url.url).join(', ')}.`;
  }

  if (supplementalSystemPrompt) {
    prompt += `\n\n${supplementalSystemPrompt}`;
  }

  return prompt;
};
