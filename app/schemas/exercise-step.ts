import { z } from 'zod';

const exercisePromptSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['ai', 'self', 'both']),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string(),
  section: z.string().optional(),
  number: z.number(),
  question: z.string(),
  type: z.enum(['text', 'multiline', 'select', 'multiselect']),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
});

const questionSetSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(questionSchema),
});

const worksheetColumnSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'rank', 'category', 'boolean']),
});

const worksheetTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  columns: z.array(worksheetColumnSchema),
  instructions: z.string().optional(),
});

const instructionSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

const resourceSchema = z.object({
  type: z.enum(['link', 'video', 'document', 'book']),
  title: z.string(),
  url: z.string().optional(),
  description: z.string().optional(),
});

const aiPromptSchema = z.object({
  id: z.string(),
  title: z.string(),
  prompt: z.string(),
  variables: z.array(z.string()).optional(),
  expectedOutput: z.string().optional(),
});

const baseStepSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  groupSharing: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const textStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('text'),
  prompts: z.array(exercisePromptSchema).nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
  aiPrompts: z.array(aiPromptSchema).nullable(),
});

const shortPhraseStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('shortPhrase'),
  prompts: z.array(exercisePromptSchema).length(1).nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
  aiPrompts: z.array(aiPromptSchema).nullable(),
});

const statementStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('statement'),
  prompts: z.array(exercisePromptSchema).nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
  aiPrompts: z.array(aiPromptSchema).nullable(),
});

const ikigaiPromptSchema = z.object({
  id: z.enum([
    'passion',
    'dislikes',
    'competency',
    'ineptitude',
    'financialSuccess',
    'financialMissed',
    'impact',
    'indifference',
  ]),
  question: z.string(),
  type: z.enum(['ai', 'self', 'both']),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
});

const ikigaiGridStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('ikigaiGrid'),
  prompts: z.array(ikigaiPromptSchema).min(8).max(8),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
  aiPrompts: z.array(aiPromptSchema).nullable(),
});

const multiPromptStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('multiPrompt'),
  prompts: z.array(exercisePromptSchema).min(1),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
  aiPrompts: z.array(aiPromptSchema).nullable(),
});

const questionnaireStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('questionnaire'),
  prompts: z.null(),
  questionSet: questionSetSchema,
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
  aiPrompts: z.array(aiPromptSchema).nullable(),
});

const categorizationStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('categorization'),
  prompts: z.array(exercisePromptSchema).nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.array(worksheetTemplateSchema).min(1),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
  aiPrompts: z.array(aiPromptSchema).nullable(),
});

const narrativeStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('narrative'),
  prompts: z.array(exercisePromptSchema).nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
  aiPrompts: z.array(aiPromptSchema).nullable(),
});

const pillarsStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('pillars'),
  prompts: z.array(exercisePromptSchema).nullable(),
  questionSet: questionSetSchema.nullable(),
  worksheetTemplates: z.array(worksheetTemplateSchema).nullable(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
  aiPrompts: z.array(aiPromptSchema).nullable(),
});

export const exerciseStepSchema = z.discriminatedUnion('responseType', [
  textStepSchema,
  shortPhraseStepSchema,
  statementStepSchema,
  ikigaiGridStepSchema,
  multiPromptStepSchema,
  questionnaireStepSchema,
  categorizationStepSchema,
  narrativeStepSchema,
  pillarsStepSchema,
]);

export type ExerciseStep = z.infer<typeof exerciseStepSchema>;
export type TextStep = z.infer<typeof textStepSchema>;
export type ShortPhraseStep = z.infer<typeof shortPhraseStepSchema>;
export type StatementStep = z.infer<typeof statementStepSchema>;
export type IkigaiGridStep = z.infer<typeof ikigaiGridStepSchema>;
export type MultiPromptStep = z.infer<typeof multiPromptStepSchema>;
export type QuestionnaireStep = z.infer<typeof questionnaireStepSchema>;
export type CategorizationStep = z.infer<typeof categorizationStepSchema>;
export type NarrativeStep = z.infer<typeof narrativeStepSchema>;
export type PillarsStep = z.infer<typeof pillarsStepSchema>;

export type ExercisePrompt = z.infer<typeof exercisePromptSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionSet = z.infer<typeof questionSetSchema>;
export type WorksheetTemplate = z.infer<typeof worksheetTemplateSchema>;
export type InstructionSection = z.infer<typeof instructionSectionSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type AIPrompt = z.infer<typeof aiPromptSchema>;
