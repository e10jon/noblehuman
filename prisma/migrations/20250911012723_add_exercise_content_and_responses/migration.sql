-- CreateEnum
CREATE TYPE "public"."ResponseType" AS ENUM ('text', 'shortPhrase', 'statement', 'ikigaiGrid', 'multiPrompt');

-- AlterTable
ALTER TABLE "public"."CompletionStep" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "responses" JSONB;

-- AlterTable
ALTER TABLE "public"."ExerciseStep" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "prompts" JSONB,
ADD COLUMN     "responseType" "public"."ResponseType" NOT NULL DEFAULT 'text',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Step';
