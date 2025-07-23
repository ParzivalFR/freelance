-- AlterTable
ALTER TABLE "testimonial_tokens" ADD COLUMN     "email_sent_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
