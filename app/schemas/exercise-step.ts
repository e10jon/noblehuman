import { z } from 'zod';

const conversationConfigSchema = z.object({
  initialPrompt: z.string(),
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
  conversationConfig: conversationConfigSchema.nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
});

const shortPhraseStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('shortPhrase'),
  conversationConfig: conversationConfigSchema.nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
});

const statementStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('statement'),
  conversationConfig: conversationConfigSchema.nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
});

const ikigaiGridStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('ikigaiGrid'),
  conversationConfig: conversationConfigSchema.nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
});

const multiPromptStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('multiPrompt'),
  conversationConfig: conversationConfigSchema.nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
});

const questionnaireStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('questionnaire'),
  conversationConfig: z.null(),
  questionSet: questionSetSchema,
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
});

const categorizationStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('categorization'),
  conversationConfig: conversationConfigSchema.nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.array(worksheetTemplateSchema).min(1),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
});

const narrativeStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('narrative'),
  conversationConfig: conversationConfigSchema.nullable(),
  questionSet: z.null(),
  worksheetTemplates: z.null(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
});

const pillarsStepSchema = baseStepSchema.extend({
  type: z.enum(['static', 'aiPrompt']),
  responseType: z.literal('pillars'),
  conversationConfig: conversationConfigSchema.nullable(),
  questionSet: questionSetSchema.nullable(),
  worksheetTemplates: z.array(worksheetTemplateSchema).nullable(),
  instructionSections: z.array(instructionSectionSchema).nullable(),
  resources: z.array(resourceSchema).nullable(),
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

export type ConversationConfig = z.infer<typeof conversationConfigSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionSet = z.infer<typeof questionSetSchema>;
export type WorksheetTemplate = z.infer<typeof worksheetTemplateSchema>;
export type InstructionSection = z.infer<typeof instructionSectionSchema>;
export type Resource = z.infer<typeof resourceSchema>;
