declare global {
  namespace PrismaJson {
    export type UserData = {
      urls: string[];
      bio: string;
    };

    export type ExerciseMetadata = {
      totalSteps?: number;
      estimatedMinutes?: number;
      prerequisites?: string[];
      outcomes?: string[];
    };

    export type ConversationConfig = {
      initialPrompt: string;
    };

    export type Question = {
      id: string;
      section?: string;
      number: number;
      question: string;
      type: 'text' | 'multiline' | 'select' | 'multiselect';
      required?: boolean;
      placeholder?: string;
    };

    export type QuestionSet = {
      title: string;
      description?: string;
      questions: Question[];
    };

    export type WorksheetTemplate = {
      id: string;
      name: string;
      columns: Array<{
        id: string;
        label: string;
        type: 'text' | 'rank' | 'category' | 'boolean';
      }>;
      instructions?: string;
    };

    export type WorksheetTemplates = WorksheetTemplate[];

    export type InstructionSection = {
      id: string;
      title: string;
      content: string;
      order: number;
    };

    export type InstructionSections = InstructionSection[];

    export type Resource = {
      type: 'link' | 'video' | 'document' | 'book';
      title: string;
      url?: string;
      description?: string;
    };

    export type Resources = Resource[];

    export type TextResponse = {
      type: 'text';
      content: string;
    };

    export type ShortPhraseResponse = {
      type: 'shortPhrase';
      content: string;
    };

    export type StatementResponse = {
      type: 'statement';
      content: string;
    };

    export type IkigaiGridResponse = {
      type: 'ikigaiGrid';
      passion: string;
      dislikes: string;
      competency: string;
      ineptitude: string;
      financialSuccess: string;
      financialMissed: string;
      impact: string;
      indifference: string;
      passionSynthesis?: string;
      dislikesSynthesis?: string;
      competencySynthesis?: string;
      ineptitudeSynthesis?: string;
      financialSuccessSynthesis?: string;
      financialMissedSynthesis?: string;
      impactSynthesis?: string;
      indifferenceSynthesis?: string;
    };

    export type MultiPromptResponse = {
      type: 'multiPrompt';
      responses: Array<{
        promptId: string;
        question: string;
        answer: string;
      }>;
    };

    export type ConversationResponse = {
      type: 'conversation';
      messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
      }>;
    };

    export type QuestionnaireResponse = {
      type: 'questionnaire';
      responses: Array<{
        questionId: string;
        section?: string;
        question: string;
        answer: string | string[];
      }>;
    };

    export type CategorizationResponse = {
      type: 'categorization';
      categories: {
        essential: Array<{
          id: string;
          desire: string;
          why: string;
          source: string;
          flipSide?: string;
          rank?: number;
        }>;
        noble: Array<{
          id: string;
          desire: string;
          why: string;
          source: string;
          flipSide?: string;
          rank?: number;
        }>;
        clinging: Array<{
          id: string;
          desire: string;
          why: string;
          source: string;
          flipSide?: string;
          rank?: number;
        }>;
      };
      synthesis?: string;
    };

    export type NarrativeResponse = {
      type: 'narrative';
      title?: string;
      genre?: string;
      content: string;
      reflections?: {
        falseBeliefs?: string[];
        empoweringBeliefs?: string[];
        liberation?: string;
      };
    };

    export type PillarsResponse = {
      type: 'pillars';
      pillar: 'wealth' | 'health' | 'self' | 'love';
      responses: Record<string, unknown>;
    };

    export type StepResponses =
      | TextResponse
      | ShortPhraseResponse
      | StatementResponse
      | IkigaiGridResponse
      | MultiPromptResponse
      | QuestionnaireResponse
      | CategorizationResponse
      | NarrativeResponse
      | PillarsResponse
      | ConversationResponse;
  }
}

export {};
