import { data } from 'react-router';
import { requireUser } from '~/lib/auth';
import { checkAndUpdateStepCompletion } from '~/lib/chat';
import { prisma } from '~/lib/db';
import type { ActionSchema } from '~/schemas/action';
import { saveResultSchema } from '~/schemas/exercise-step';

export const action = async ({ request }: { request: Request }) => {
  try {
    const user = await requireUser(request);
    const json = await request.json();
    const { completionStepId, result } = saveResultSchema.parse(json);

    // Verify that the completion step belongs to the user and get the exercise step
    const completionStep = await prisma.completionStep.findFirstOrThrow({
      where: {
        id: completionStepId,
        completion: { userId: user.id },
      },
      include: {
        exerciseStep: true,
        completion: true,
      },
    });

    // Update the completion step with the result
    await prisma.completionStep.update({
      where: { id: completionStepId },
      data: { result },
    });

    // Check if step should be marked as completed
    await checkAndUpdateStepCompletion(completionStepId, completionStep.exerciseStep, result);

    // Fetch updated completion data including completion message
    const updatedCompletion = await prisma.completion.findUniqueOrThrow({
      where: { id: completionStep.completion.id },
      include: {
        steps: true,
      },
    });

    return data(
      {
        success: 'Result saved successfully!',
        completion: updatedCompletion,
      },
      { status: 200 }
    );
  } catch {
    return data({ error: 'Failed to save result' } satisfies ActionSchema, { status: 500 });
  }
};
