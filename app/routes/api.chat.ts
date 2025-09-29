import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { convertHtmlToMarkdown } from 'dom-to-semantic-markdown';
import Handlebars from 'handlebars';
import { JSDOM } from 'jsdom';
import { checkAndUpdateStepCompletion, getStepCompletionRequirement, type SystemPromptVariables } from '~/lib/chat';
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

  // Get system prompt template from settings
  const systemPromptTemplate = await getSystemPromptTemplate();
  const compiledSystemPrompt = await createCompleteSystemPrompt({
    user,
    supplementalSystemPrompt: systemPrompt,
    template: systemPromptTemplate,
  });

  const result = streamText({
    model: openai('gpt-4o'),
    system: compiledSystemPrompt,
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

        // Check if step should be marked as completed after conversation
        const completionStep = await prisma.completionStep.findUnique({
          where: { id: completionStepId },
          include: { exerciseStep: true },
        });

        if (completionStep) {
          const requirement = getStepCompletionRequirement(completionStep.exerciseStep);
          await checkAndUpdateStepCompletion(completionStepId, requirement, { hasConversation: true });
        }
      }
    },
  });

  return result.toUIMessageStreamResponse();
};

const getSystemPromptTemplate = async (): Promise<string> => {
  const systemSettings = await prisma.systemSettings.findUniqueOrThrow({
    where: { key: 'systemPromptTemplate' },
  });

  return systemSettings?.stringValue || '';
};

const createCompleteSystemPrompt = async ({
  user,
  supplementalSystemPrompt,
  template,
}: {
  user: User;
  supplementalSystemPrompt?: string;
  template: string;
}) => {
  // Prepare data for Handlebars template
  const templateData = {
    bio: user.data.bio,
    urls: user.data.urls.length > 0 ? user.data.urls.map((u) => `${u.description}: ${u.url}`).join(', ') : '',
  } satisfies SystemPromptVariables;

  // Compile and execute the Handlebars template
  const compiledTemplate = Handlebars.compile(template);
  const htmlPrompt = compiledTemplate(templateData);

  // Convert HTML to markdown for AI consumption
  const dom = new JSDOM();
  let prompt = convertHtmlToMarkdown(htmlPrompt, {
    overrideDOMParser: new dom.window.DOMParser(),
  });

  // Add supplemental system prompt if provided
  if (supplementalSystemPrompt) {
    prompt += `\n\n${supplementalSystemPrompt}`;
  }

  return prompt;
};
