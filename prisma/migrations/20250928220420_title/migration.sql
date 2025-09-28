/*
  Warnings:

  - Added the required column `title` to the `ExerciseStep` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Completion" DROP CONSTRAINT "Completion_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Completion" DROP CONSTRAINT "Completion_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompletionStep" DROP CONSTRAINT "CompletionStep_completionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompletionStep" DROP CONSTRAINT "CompletionStep_exerciseStepId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ConversationMessage" DROP CONSTRAINT "ConversationMessage_completionStepId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExerciseStep" DROP CONSTRAINT "ExerciseStep_exerciseId_fkey";

-- AlterTable
ALTER TABLE "public"."ExerciseStep" ADD COLUMN     "title" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ExerciseStep" ADD CONSTRAINT "ExerciseStep_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Completion" ADD CONSTRAINT "Completion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Completion" ADD CONSTRAINT "Completion_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompletionStep" ADD CONSTRAINT "CompletionStep_completionId_fkey" FOREIGN KEY ("completionId") REFERENCES "public"."Completion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompletionStep" ADD CONSTRAINT "CompletionStep_exerciseStepId_fkey" FOREIGN KEY ("exerciseStepId") REFERENCES "public"."ExerciseStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationMessage" ADD CONSTRAINT "ConversationMessage_completionStepId_fkey" FOREIGN KEY ("completionStepId") REFERENCES "public"."CompletionStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
