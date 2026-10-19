/*
  Warnings:

  - The `replace_by_token_id` column on the `refresh_token` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "refresh_token" ALTER COLUMN "used_at" DROP NOT NULL,
DROP COLUMN "replace_by_token_id",
ADD COLUMN     "replace_by_token_id" UUID;

-- CreateIndex
CREATE INDEX "refresh_token_user_id_idx" ON "refresh_token"("user_id");

-- CreateIndex
CREATE INDEX "refresh_token_family_id_idx" ON "refresh_token"("family_id");
