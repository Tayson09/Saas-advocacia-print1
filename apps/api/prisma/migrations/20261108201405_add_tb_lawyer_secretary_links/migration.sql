-- CreateTable
CREATE TABLE "lawyer_secretary_links" (
    "id" UUID NOT NULL,
    "lawyer_id" UUID NOT NULL,
    "secretary_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lawyer_secretary_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lawyer_secretary_links_lawyer_id_end_date_idx" ON "lawyer_secretary_links"("lawyer_id", "end_date");

-- CreateIndex
CREATE INDEX "lawyer_secretary_links_secretary_id_end_date_idx" ON "lawyer_secretary_links"("secretary_id", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "lawyer_secretary_links_lawyer_id_secretary_id_start_date_key" ON "lawyer_secretary_links"("lawyer_id", "secretary_id", "start_date");

-- AddForeignKey
ALTER TABLE "lawyer_secretary_links" ADD CONSTRAINT "lawyer_secretary_links_lawyer_id_fkey" FOREIGN KEY ("lawyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lawyer_secretary_links" ADD CONSTRAINT "lawyer_secretary_links_secretary_id_fkey" FOREIGN KEY ("secretary_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
