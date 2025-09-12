import { z } from 'zod';

export const profileSchema = z.object({
  bio: z.string().max(500, 'Bio must be 500 characters or less'),
  urls: z.array(
    z.object({
      value: z.union([z.string().url('Must be a valid URL'), z.literal('')]),
    })
  ),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
