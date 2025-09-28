import { z } from 'zod';

export const adminSettingsActionSchema = z.object({
  action: z.literal('updateSystemPrompt'),
  systemPromptTemplate: z.string().min(1, 'System prompt template cannot be empty'),
});

export type AdminSettingsAction = z.infer<typeof adminSettingsActionSchema>;
