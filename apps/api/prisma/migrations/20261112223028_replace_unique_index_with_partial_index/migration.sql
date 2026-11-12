-- DropIndex
DROP INDEX "lawyer_secretary_links_lawyer_id_secretary_id_start_date_key";

CREATE UNIQUE INDEX "unique_active_lawyer_secretary_link"
ON "lawyer_secretary_links"("lawyer_id", "secretary_id", "start_date")
WHERE "canceled_at" is NULL;
