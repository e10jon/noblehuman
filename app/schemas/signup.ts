import { z } from 'zod';

export const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  redirectTo: z.string().optional(),
});

export type SignupSchema = z.infer<typeof signupSchema>;
