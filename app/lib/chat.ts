import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import Handlebars from 'handlebars';
import type { Completion, CompletionStep, ConversationMessage, ExerciseStep } from '../../prisma/generated/client';
import { prisma } from './db';

export async function findOrCreateCompletionWithSteps(args: {
  userId: string;
  exerciseId: string;
  exerciseSteps: ExerciseStep[];
}): Promise<Completion & { steps: (CompletionStep & { messages: ConversationMessage[] })[] }> {
  const { userId, exerciseId, exerciseSteps } = args;

  // Find or create completion for this user and exercise
  const baseCompletion =
    (await prisma.completion.findFirst({
      where: { userId, exerciseId },
      include: { steps: true },
    })) ||
    (await prisma.completion.create({
      data: { userId, exerciseId },
      include: { steps: true },
    }));

  // Create completion steps for each exercise step if they don't exist
  for (const exerciseStep of exerciseSteps) {
    const existingCompletionStep = baseCompletion.steps.find((step) => step.exerciseStepId === exerciseStep.id);

    if (!existingCompletionStep) {
      await prisma.completionStep.create({
        data: {
          completionId: baseCompletion.id,
          exerciseStepId: exerciseStep.id,
          completed: false,
        },
      });
    }
  }

  // Refetch completion with all steps and messages
  const completion = await prisma.completion.findUniqueOrThrow({
    where: { id: baseCompletion.id },
    include: {
      steps: {
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  return completion;
}

export type SystemPromptVariables = {
  bio: string;
  urls: string;
};

export type CompletionMessageVariables = {
  content?: string;
  result?: string;
}[];

export async function generateCompletionMessage(
  completion: Completion & {
    steps: (CompletionStep & { exerciseStep: ExerciseStep })[];
  }
): Promise<string> {
  const exerciseCompletedSettings = await prisma.systemSettings.findUnique({
    where: { key: 'exerciseCompletedPromptTemplate' },
  });

  const template = exerciseCompletedSettings?.stringValue;
  if (!template) {
    return 'Congratulations! You have completed all the steps of this exercise.';
  }

  const exerciseStepsData = completion.steps.reduce<CompletionMessageVariables>((acc, step) => {
    const stepData: CompletionMessageVariables[number] = {};
    const content = step.exerciseStep.content?.blocks?.map((block) => block.content).join(' ');
    if (content?.trim()) stepData.content = content;
    if (step.result?.trim()) stepData.result = step.result;
    if (Object.keys(stepData).length > 0) acc.push(stepData);
    return acc;
  }, []);

  const compiled = Handlebars.compile(template);
  const prompt = compiled({ exerciseSteps: exerciseStepsData });

  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt,
  });

  return text;
}

export async function checkAndUpdateStepCompletion(
  completionStepId: string,
  exerciseStep: ExerciseStep,
  result: string
): Promise<void> {
  const hasResultPrompt = Boolean(exerciseStep.content.resultPrompt);
  const hasResult = Boolean(result?.trim());

  if (hasResultPrompt && hasResult) {
    const step = await prisma.completionStep.update({
      where: { id: completionStepId },
      data: { completed: true },
    });

    // Check if all steps in the completion are now completed and the message is not set
    const completion = await prisma.completion.findFirst({
      where: {
        id: step.completionId,
        steps: { every: { completed: true } },
        completionMessage: null,
      },
      include: {
        steps: {
          include: { exerciseStep: true },
          orderBy: { exerciseStep: { order: 'asc' } },
        },
        exercise: true,
      },
    });

    if (completion) {
      const completionMessage = await generateCompletionMessage(completion);

      await prisma.completion.update({
        where: { id: completion.id },
        data: { completionMessage },
      });
    }
  }
}
