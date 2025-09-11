-- CreateEnum
CREATE TYPE "public"."ExerciseStepType" AS ENUM ('static', 'aiPrompt');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExerciseStep" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "public"."ExerciseStepType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserExercise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserExerciseStep" (
    "id" TEXT NOT NULL,
    "exerciseStepId" TEXT NOT NULL,
    "userExerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserExerciseStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "ExerciseStep_exerciseId_idx" ON "public"."ExerciseStep"("exerciseId");

-- CreateIndex
CREATE INDEX "UserExercise_userId_idx" ON "public"."UserExercise"("userId");

-- CreateIndex
CREATE INDEX "UserExercise_exerciseId_idx" ON "public"."UserExercise"("exerciseId");

-- CreateIndex
CREATE INDEX "UserExerciseStep_userExerciseId_idx" ON "public"."UserExerciseStep"("userExerciseId");

-- CreateIndex
CREATE INDEX "UserExerciseStep_exerciseStepId_idx" ON "public"."UserExerciseStep"("exerciseStepId");

-- AddForeignKey
ALTER TABLE "public"."ExerciseStep" ADD CONSTRAINT "ExerciseStep_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserExercise" ADD CONSTRAINT "UserExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserExercise" ADD CONSTRAINT "UserExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserExerciseStep" ADD CONSTRAINT "UserExerciseStep_userExerciseId_fkey" FOREIGN KEY ("userExerciseId") REFERENCES "public"."UserExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserExerciseStep" ADD CONSTRAINT "UserExerciseStep_exerciseStepId_fkey" FOREIGN KEY ("exerciseStepId") REFERENCES "public"."ExerciseStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
