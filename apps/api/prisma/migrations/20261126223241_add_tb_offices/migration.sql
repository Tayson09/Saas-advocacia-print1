-- CreateTable
CREATE TABLE "offices" (
    "id" UUID NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "name" TEXT NOT NULL,
    "trade_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offices_cnpj_key" ON "offices"("cnpj");
