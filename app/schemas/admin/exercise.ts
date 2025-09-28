import { z } from 'zod';

export const createExerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
});

export type CreateExercise = z.infer<typeof createExerciseSchema>;

export const adminExerciseActionSchema = z.object({
  action: z.literal('deleteExercise'),
  exerciseId: z.string(),
});

export type AdminExerciseAction = z.infer<typeof adminExerciseActionSchema>;

export const updateExerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
});

export type UpdateExercise = z.infer<typeof updateExerciseSchema>;

export const blockSchema = z.object({
  content: z.string().optional(),
  systemPrompt: z.string().optional(),
  initialUserPrompt: z.string().optional(),
  resultPrompt: z.string().optional(),
});

export type Block = z.infer<typeof blockSchema>;

export const addStepSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  blocks: z.array(blockSchema).min(1, 'At least one block is required'),
});

export type AddStep = z.infer<typeof addStepSchema>;

export const updateStepSchema = z.object({
  stepId: z.string(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  systemPrompt: z.string().optional(),
  initialUserPrompt: z.string().optional(),
  resultPrompt: z.string().optional(),
});

export type UpdateStep = z.infer<typeof updateStepSchema>;

export const addBlockSchema = z.object({
  stepId: z.string(),
  content: z.string().optional(),
  systemPrompt: z.string().optional(),
  initialUserPrompt: z.string().optional(),
  resultPrompt: z.string().optional(),
});

export type AddBlock = z.infer<typeof addBlockSchema>;

export const updateBlockSchema = z.object({
  stepId: z.string(),
  blockIndex: z.number().min(0),
  content: z.string().optional(),
  systemPrompt: z.string().optional(),
  initialUserPrompt: z.string().optional(),
  resultPrompt: z.string().optional(),
});

export type UpdateBlock = z.infer<typeof updateBlockSchema>;

export const deleteBlockSchema = z.object({
  stepId: z.string(),
  blockIndex: z.number().min(0),
});

export type DeleteBlock = z.infer<typeof deleteBlockSchema>;

export const reorderBlockSchema = z.object({
  stepId: z.string(),
  blockIndex: z.number().min(0),
  direction: z.enum(['up', 'down']),
});

export type ReorderBlock = z.infer<typeof reorderBlockSchema>;

export const exerciseActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('updateExercise'),
    name: z.string().min(1, 'Exercise name is required'),
  }),
  z.object({
    action: z.literal('addStep'),
    title: z.string().min(1, 'Title is required'),
    blocks: z.array(blockSchema).min(1, 'At least one block is required'),
  }),
  z.object({
    action: z.literal('updateStep'),
    stepId: z.string(),
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
    systemPrompt: z.string().optional(),
    initialUserPrompt: z.string().optional(),
    resultPrompt: z.string().optional(),
  }),
  z.object({
    action: z.literal('deleteStep'),
    stepId: z.string(),
  }),
  z.object({
    action: z.literal('reorderStep'),
    stepId: z.string(),
    direction: z.enum(['up', 'down']),
  }),
  z.object({
    action: z.literal('addBlock'),
    stepId: z.string(),
    content: z.string().optional(),
    systemPrompt: z.string().optional(),
    initialUserPrompt: z.string().optional(),
    resultPrompt: z.string().optional(),
  }),
  z.object({
    action: z.literal('updateBlock'),
    stepId: z.string(),
    blockIndex: z.number().min(0),
    content: z.string().optional(),
    systemPrompt: z.string().optional(),
    initialUserPrompt: z.string().optional(),
    resultPrompt: z.string().optional(),
  }),
  z.object({
    action: z.literal('deleteBlock'),
    stepId: z.string(),
    blockIndex: z.number().min(0),
  }),
  z.object({
    action: z.literal('reorderBlock'),
    stepId: z.string(),
    blockIndex: z.number().min(0),
    direction: z.enum(['up', 'down']),
  }),
]);

export type ExerciseAction = z.infer<typeof exerciseActionSchema>;
