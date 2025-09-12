/*
  Warnings:

  - You are about to drop the column `aiPrompts` on the `ExerciseStep` table. All the data in the column will be lost.
  - You are about to drop the column `prompts` on the `ExerciseStep` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."MessageRole" AS ENUM ('user', 'assistant', 'system');

-- AlterTable
ALTER TABLE "public"."ExerciseStep" DROP COLUMN "aiPrompts",
DROP COLUMN "prompts",
ADD COLUMN     "conversationConfig" JSONB;

-- CreateTable
CREATE TABLE "public"."ConversationMessage" (
    "id" TEXT NOT NULL,
    "completionStepId" TEXT NOT NULL,
    "role" "public"."MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationMessage_completionStepId_idx" ON "public"."ConversationMessage"("completionStepId");

-- AddForeignKey
ALTER TABLE "public"."ConversationMessage" ADD CONSTRAINT "ConversationMessage_completionStepId_fkey" FOREIGN KEY ("completionStepId") REFERENCES "public"."CompletionStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
