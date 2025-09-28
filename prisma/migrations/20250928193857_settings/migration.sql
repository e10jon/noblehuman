/*
  Warnings:

  - You are about to drop the column `systemPromptTemplate` on the `SystemSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `SystemSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `booleanValue` to the `SystemSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `SystemSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberValue` to the `SystemSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stringValue` to the `SystemSettings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SystemSettingsKey" AS ENUM ('systemPromptTemplate');

-- AlterTable
ALTER TABLE "public"."SystemSettings" DROP COLUMN "systemPromptTemplate",
ADD COLUMN     "booleanValue" BOOLEAN NOT NULL,
ADD COLUMN     "key" "public"."SystemSettingsKey" NOT NULL,
ADD COLUMN     "numberValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "stringValue" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "public"."SystemSettings"("key");
