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
      resultPrompt: z.string().optional(),
    })
  ),
});

export type ExerciseStepContent = z.infer<typeof exerciseStepContentSchema>;

export const saveResultSchema = z.object({
  completionStepId: z.string(),
  result: z.string(),
});

export type SaveResult = z.infer<typeof saveResultSchema>;
