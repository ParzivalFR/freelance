-- Ajout du module Statut bot (présence Discord)
ALTER TABLE "discord_bots" ADD COLUMN IF NOT EXISTS "module_status" BOOLEAN NOT NULL DEFAULT false;
