/*
  Warnings:

  - Made the column `session_expires_at` on table `refresh_token` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "refresh_token" ALTER COLUMN "session_expires_at" SET NOT NULL;
