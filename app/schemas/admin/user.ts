import { z } from 'zod';

export const adminUserActionSchema = z.object({
  action: z.enum(['toggleAdmin', 'deleteUser']),
  userId: z.string(),
});

export type AdminUserAction = z.infer<typeof adminUserActionSchema>;

export const editUserDataSchema = z.object({
  bio: z.string(),
  urls: z.string(),
});

export type EditUserData = z.infer<typeof editUserDataSchema>;
