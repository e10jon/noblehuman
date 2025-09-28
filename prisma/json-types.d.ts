import type { UIMessagePart as VercelUIMessagePart } from 'ai';
import type { ExerciseStepContent as ExerciseStepContentSchema } from '../app/schemas/exercise-step';
import type { UserData as UserDataSchema } from '../app/schemas/user';

declare global {
  namespace PrismaJson {
    export type UserData = UserDataSchema;
    export type ExerciseStepContent = ExerciseStepContentSchema;
    export type UIMessageParts = VercelUIMessagePart[];
  }
}
