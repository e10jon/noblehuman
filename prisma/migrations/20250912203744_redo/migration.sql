/*
  Warnings:

  - You are about to drop the column `responses` on the `CompletionStep` table. All the data in the column will be lost.
  - You are about to drop the column `buddhismConcept` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `pillarType` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `weekNumber` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `conversationConfig` on the `ExerciseStep` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ExerciseStep` table. All the data in the column will be lost.
  - You are about to drop the column `groupSharing` on the `ExerciseStep` table. All the data in the column will be lost.
  - You are about to drop the column `instructionSections` on the `ExerciseStep` table. All the data in the column will be lost.
  - You are about to drop the column `questionSet` on the `ExerciseStep` table. All the data in the column will be lost.
  - You are about to drop the column `resources` on the `ExerciseStep` table. All the data in the column will be lost.
  - You are about to drop the column `responseType` on the `ExerciseStep` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ExerciseStep` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ExerciseStep` table. All the data in the column will be lost.
  - You are about to drop the column `worksheetTemplates` on the `ExerciseStep` table. All the data in the column will be lost.
  - Added the required column `result` to the `CompletionStep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `ExerciseStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CompletionStep" DROP COLUMN "responses",
ADD COLUMN     "result" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Exercise" DROP COLUMN "buddhismConcept",
DROP COLUMN "metadata",
DROP COLUMN "pillarType",
DROP COLUMN "weekNumber";

-- AlterTable
ALTER TABLE "public"."ExerciseStep" DROP COLUMN "conversationConfig",
DROP COLUMN "description",
DROP COLUMN "groupSharing",
DROP COLUMN "instructionSections",
DROP COLUMN "questionSet",
DROP COLUMN "resources",
DROP COLUMN "responseType",
DROP COLUMN "title",
DROP COLUMN "type",
DROP COLUMN "worksheetTemplates",
ADD COLUMN     "content" JSONB NOT NULL;

-- DropEnum
DROP TYPE "public"."ExerciseStepType";

-- DropEnum
DROP TYPE "public"."ResponseType";
