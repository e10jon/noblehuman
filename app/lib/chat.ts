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
