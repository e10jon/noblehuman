import { z } from 'zod';

export const exerciseStepContentSchema = z.object({
  blocks: z.array(
    z.object({
      content: z.string().optional(),
      ai: z
        .object({
          systemPrompt: z.string().optional(),
          initialUserPrompt: z.string().optional(),
        })
        .optional(),
    })
  ),
});

export type ExerciseStepContent = z.infer<typeof exerciseStepContentSchema>;
