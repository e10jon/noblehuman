-- AlterTable
ALTER TABLE "public"."SystemSettings" ALTER COLUMN "booleanValue" DROP NOT NULL,
ALTER COLUMN "numberValue" DROP NOT NULL,
ALTER COLUMN "stringValue" DROP NOT NULL;
