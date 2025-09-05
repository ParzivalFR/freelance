-- CreateTable
CREATE TABLE "devis" (
    "id" TEXT NOT NULL,
    "devis_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "client_first_name" TEXT NOT NULL,
    "client_last_name" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "client_phone" TEXT,
    "client_company" TEXT,
    "client_address" TEXT,
    "company_name" TEXT NOT NULL,
    "company_address" TEXT NOT NULL,
    "company_phone" TEXT NOT NULL,
    "company_email" TEXT NOT NULL,
    "company_siret" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tva_rate" DOUBLE PRECISION NOT NULL,
    "tva_amount" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "tva_applicable" BOOLEAN NOT NULL,
    "items" JSONB NOT NULL,
    "notes" TEXT,
    "sent_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devis_devis_number_key" ON "devis"("devis_number");
