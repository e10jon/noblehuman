import { z } from 'zod';

export const actionSchema = z.object({
  success: z.string().optional(),
  error: z.string().optional(),
});

export type ActionSchema = z.infer<typeof actionSchema>;
