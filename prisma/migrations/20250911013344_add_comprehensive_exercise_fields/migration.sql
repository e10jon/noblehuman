-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ResponseType" ADD VALUE 'questionnaire';
ALTER TYPE "public"."ResponseType" ADD VALUE 'categorization';
ALTER TYPE "public"."ResponseType" ADD VALUE 'narrative';
ALTER TYPE "public"."ResponseType" ADD VALUE 'pillars';

-- AlterTable
ALTER TABLE "public"."Exercise" ADD COLUMN     "buddhismConcept" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "pillarType" TEXT,
ADD COLUMN     "weekNumber" INTEGER;

-- AlterTable
ALTER TABLE "public"."ExerciseStep" ADD COLUMN     "aiPrompts" JSONB,
ADD COLUMN     "groupSharing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "instructionSections" JSONB,
ADD COLUMN     "questionSet" JSONB,
ADD COLUMN     "resources" JSONB,
ADD COLUMN     "worksheetTemplates" JSONB;
