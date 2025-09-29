import { data } from 'react-router';
import { requireUser } from '~/lib/auth';
import { checkAndUpdateStepCompletion, getStepCompletionRequirement } from '~/lib/chat';
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
      },
    });

    // Update the completion step with the result
    await prisma.completionStep.update({
      where: { id: completionStepId },
      data: { result },
    });

    // Check if step should be marked as completed
    const requirement = getStepCompletionRequirement(completionStep.exerciseStep);
    await checkAndUpdateStepCompletion(completionStepId, requirement, { result });

    return data({ success: 'Result saved successfully!' } satisfies ActionSchema, { status: 200 });
  } catch {
    return data({ error: 'Failed to save result' } satisfies ActionSchema, { status: 500 });
  }
};
