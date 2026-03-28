-- AlterTable
ALTER TABLE "discord_bots" ADD COLUMN     "plan_ends_at" TIMESTAMP(3),
ADD COLUMN     "stripe_subscription_id" TEXT;
