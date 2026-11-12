-- AlterTable
ALTER TABLE "lawyer_secretary_links" ADD COLUMN     "canceled_at" TIMESTAMP(3),
ADD COLUMN     "canceled_by_id" UUID,
ADD COLUMN     "cancellation_reason" TEXT;

-- AddForeignKey
ALTER TABLE "lawyer_secretary_links" ADD CONSTRAINT "lawyer_secretary_links_canceled_by_id_fkey" FOREIGN KEY ("canceled_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
