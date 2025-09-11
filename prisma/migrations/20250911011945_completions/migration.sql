/*
  Warnings:

  - You are about to drop the `UserExercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserExerciseStep` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserExercise" DROP CONSTRAINT "UserExercise_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserExercise" DROP CONSTRAINT "UserExercise_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserExerciseStep" DROP CONSTRAINT "UserExerciseStep_exerciseStepId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserExerciseStep" DROP CONSTRAINT "UserExerciseStep_userExerciseId_fkey";

-- DropTable
DROP TABLE "public"."UserExercise";

-- DropTable
DROP TABLE "public"."UserExerciseStep";

-- CreateTable
CREATE TABLE "public"."Completion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Completion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompletionStep" (
    "id" TEXT NOT NULL,
    "exerciseStepId" TEXT NOT NULL,
    "completionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompletionStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Completion_userId_idx" ON "public"."Completion"("userId");

-- CreateIndex
CREATE INDEX "Completion_exerciseId_idx" ON "public"."Completion"("exerciseId");

-- CreateIndex
CREATE INDEX "CompletionStep_completionId_idx" ON "public"."CompletionStep"("completionId");

-- CreateIndex
CREATE INDEX "CompletionStep_exerciseStepId_idx" ON "public"."CompletionStep"("exerciseStepId");

-- AddForeignKey
ALTER TABLE "public"."Completion" ADD CONSTRAINT "Completion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Completion" ADD CONSTRAINT "Completion_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompletionStep" ADD CONSTRAINT "CompletionStep_completionId_fkey" FOREIGN KEY ("completionId") REFERENCES "public"."Completion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompletionStep" ADD CONSTRAINT "CompletionStep_exerciseStepId_fkey" FOREIGN KEY ("exerciseStepId") REFERENCES "public"."ExerciseStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
