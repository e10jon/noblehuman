declare global {
  namespace PrismaJson {
    export type UserData = {
      urls: string[];
      bio: string;
    };

    export type ExerciseStepContent = {
      blocks: {
        content?: string; // richtext via WYSIWYG
        ai?: {
          // Will start a conversation with the AI
          systemPrompt?: string;
          initialUserPrompt?: string; // If provided, the AI will go first in response
        };
      };
    };
  }
}

export {};
