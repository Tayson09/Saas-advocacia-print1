-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'OTHER');

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "office_id" UUID NOT NULL,
    "type" "ClientType" NOT NULL,
    "name" TEXT NOT NULL,
    "document" VARCHAR(14) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "individual_clients" (
    "client_id" UUID NOT NULL,
    "birth_date" DATE,
    "rg" TEXT,
    "marital_status" TEXT,
    "profession" TEXT,
    "nationality" TEXT,

    CONSTRAINT "individual_clients_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "company_clients" (
    "client_id" UUID NOT NULL,
    "trade_name" TEXT,
    "state_registration" TEXT,
    "municipal_registration" TEXT,
    "opening_date" DATE,
    "legal_nature" TEXT,

    CONSTRAINT "company_clients_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "client_addresses" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "type" "AddressType" NOT NULL,
    "zip_code" VARCHAR(8) NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clients_office_id_idx" ON "clients"("office_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_office_id_document_key" ON "clients"("office_id", "document");

-- CreateIndex
CREATE INDEX "client_addresses_client_id_idx" ON "client_addresses"("client_id");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "individual_clients" ADD CONSTRAINT "individual_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_clients" ADD CONSTRAINT "company_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
