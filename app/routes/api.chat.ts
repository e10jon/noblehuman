import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import type { User } from '../../prisma/generated/client';
import { requireUser } from '../lib/auth';
import { prisma } from '../lib/db';

export const action = async ({ request }: { request: Request }) => {
  const {
    message,
    systemPrompt,
    completionStepId,
  }: {
    message: UIMessage;
    systemPrompt?: string;
    completionStepId?: string;
  } = await request.json();

  const user = await requireUser(request);

  // Load existing messages from database if we have a completion step
  let allMessages: UIMessage[] = [];
  if (completionStepId) {
    allMessages = await prisma.conversationMessage.findMany({
      where: { completionStepId },
      orderBy: { createdAt: 'asc' },
    });

    // Save the new user message to database
    if (message.role === 'user') {
      await prisma.conversationMessage.create({
        data: {
          completionStepId,
          role: 'user',
          parts: message.parts,
        },
      });
    }
  }

  // Add the new message to the conversation
  allMessages.push(message);

  const result = streamText({
    model: openai('gpt-4o'),
    system: createCompleteSystemPrompt({ user, supplementalSystemPrompt: systemPrompt }),
    messages: convertToModelMessages(allMessages),
    tools: {
      web_search: openai.tools.webSearch({}),
    },
    onFinish: async (result) => {
      // Save the assistant message to database if we have a completion step
      if (completionStepId && result.text) {
        await prisma.conversationMessage.create({
          data: {
            completionStepId,
            role: 'assistant',
            parts: [{ type: 'text', text: result.text }],
          },
        });
      }
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
