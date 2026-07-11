-- AlterTable
ALTER TABLE "discord_bots" ADD COLUMN IF NOT EXISTS "module_honeypot" BOOLEAN NOT NULL DEFAULT false;
