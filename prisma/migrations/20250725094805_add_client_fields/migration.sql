-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "company" TEXT,
ADD COLUMN     "last_contact_at" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'prospect',
ADD COLUMN     "website" TEXT;
