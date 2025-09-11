import { z } from 'zod';

export const textResponseSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
});

export const shortPhraseResponseSchema = z.object({
  type: z.literal('shortPhrase'),
  content: z.string().min(1, 'Response is required'),
});

const statementResponseSchema = z.object({
  type: z.literal('statement'),
  content: z.string(),
});

export const ikigaiResponseSchema = z.object({
  type: z.literal('ikigaiGrid'),
  passion: z.string(),
  dislikes: z.string(),
  competency: z.string(),
  ineptitude: z.string(),
  financialSuccess: z.string(),
  financialMissed: z.string(),
  impact: z.string(),
  indifference: z.string(),
  passionSynthesis: z.string().optional(),
  dislikesSynthesis: z.string().optional(),
  competencySynthesis: z.string().optional(),
  ineptitudeSynthesis: z.string().optional(),
  financialSuccessSynthesis: z.string().optional(),
  financialMissedSynthesis: z.string().optional(),
  impactSynthesis: z.string().optional(),
  indifferenceSynthesis: z.string().optional(),
});

const multiPromptResponseSchema = z.object({
  type: z.literal('multiPrompt'),
  responses: z.array(
    z.object({
      promptId: z.string(),
      question: z.string(),
      answer: z.string(),
    })
  ),
});

export const questionnaireResponseSchema = z.object({
  type: z.literal('questionnaire'),
  responses: z.array(
    z.object({
      questionId: z.string(),
      section: z.string().optional(),
      question: z.string(),
      answer: z.union([z.string(), z.array(z.string())]),
    })
  ),
});

const categorizationResponseSchema = z.object({
  type: z.literal('categorization'),
  categories: z.object({
    essential: z.array(
      z.object({
        id: z.string(),
        desire: z.string(),
        why: z.string(),
        source: z.string(),
        flipSide: z.string().optional(),
        rank: z.number().optional(),
      })
    ),
    noble: z.array(
      z.object({
        id: z.string(),
        desire: z.string(),
        why: z.string(),
        source: z.string(),
        flipSide: z.string().optional(),
        rank: z.number().optional(),
      })
    ),
    clinging: z.array(
      z.object({
        id: z.string(),
        desire: z.string(),
        why: z.string(),
        source: z.string(),
        flipSide: z.string().optional(),
        rank: z.number().optional(),
      })
    ),
  }),
  synthesis: z.string().optional(),
});

const narrativeResponseSchema = z.object({
  type: z.literal('narrative'),
  title: z.string().optional(),
  genre: z.string().optional(),
  content: z.string(),
  reflections: z
    .object({
      falseBeliefs: z.array(z.string()).optional(),
      empoweringBeliefs: z.array(z.string()).optional(),
      liberation: z.string().optional(),
    })
    .optional(),
});

const pillarsResponseSchema = z.object({
  type: z.literal('pillars'),
  pillar: z.enum(['wealth', 'health', 'self', 'love']),
  responses: z.record(z.string(), z.unknown()),
});

export const stepResponseSchema = z.discriminatedUnion('type', [
  textResponseSchema,
  shortPhraseResponseSchema,
  statementResponseSchema,
  ikigaiResponseSchema,
  multiPromptResponseSchema,
  questionnaireResponseSchema,
  categorizationResponseSchema,
  narrativeResponseSchema,
  pillarsResponseSchema,
]);

export const completionActionSchema = z.object({
  stepId: z.string(),
  exerciseId: z.string(),
  action: z.enum(['save', 'complete', 'next', 'previous']),
  responses: stepResponseSchema,
});

export type StepResponse = z.infer<typeof stepResponseSchema>;
export type TextResponse = z.infer<typeof textResponseSchema>;
export type ShortPhraseResponse = z.infer<typeof shortPhraseResponseSchema>;
export type StatementResponse = z.infer<typeof statementResponseSchema>;
export type IkigaiResponse = z.infer<typeof ikigaiResponseSchema>;
export type MultiPromptResponse = z.infer<typeof multiPromptResponseSchema>;
export type QuestionnaireResponse = z.infer<typeof questionnaireResponseSchema>;
export type CategorizationResponse = z.infer<typeof categorizationResponseSchema>;
export type NarrativeResponse = z.infer<typeof narrativeResponseSchema>;
export type PillarsResponse = z.infer<typeof pillarsResponseSchema>;
export type CompletionAction = z.infer<typeof completionActionSchema>;
