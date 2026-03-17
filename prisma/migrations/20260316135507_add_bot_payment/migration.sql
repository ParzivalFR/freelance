-- AlterTable
ALTER TABLE "discord_bots" ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "plan" TEXT,
ADD COLUMN     "stripe_session_id" TEXT;
