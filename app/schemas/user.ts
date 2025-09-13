import { z } from 'zod';

export const userDataSchema = z.object({
  urls: z.array(z.object({ description: z.string(), url: z.string() })),
  bio: z.string(),
});

export type UserData = z.infer<typeof userDataSchema>;
