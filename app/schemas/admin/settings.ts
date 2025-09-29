import { z } from 'zod';

export const adminSettingsActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('updateSystemPrompt'),
    systemPromptTemplate: z.string().min(1, 'System prompt template cannot be empty'),
  }),
  z.object({
    action: z.literal('updateExerciseCompletedPrompt'),
    exerciseCompletedPromptTemplate: z.string().min(1, 'Exercise completed prompt template cannot be empty'),
  }),
]);

export type AdminSettingsAction = z.infer<typeof adminSettingsActionSchema>;
