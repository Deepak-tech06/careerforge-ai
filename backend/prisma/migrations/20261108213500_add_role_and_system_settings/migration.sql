-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "theme" TEXT NOT NULL DEFAULT 'DEFAULT',

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

