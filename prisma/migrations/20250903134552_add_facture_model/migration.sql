-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "facture_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "devis_id" TEXT,
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
    "due_date" TIMESTAMP(3) NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tva_rate" DOUBLE PRECISION NOT NULL,
    "tva_amount" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "tva_applicable" BOOLEAN NOT NULL,
    "items" JSONB NOT NULL,
    "notes" TEXT,
    "paid_at" TIMESTAMP(3),
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "factures_facture_number_key" ON "factures"("facture_number");
