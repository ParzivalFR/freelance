-- Ajout des colonnes de modules manquantes dans discord_bots
-- Ces colonnes ont été ajoutées via db push — on les documente ici proprement.

ALTER TABLE "discord_bots" ADD COLUMN IF NOT EXISTS "module_verification" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "discord_bots" ADD COLUMN IF NOT EXISTS "module_tempchannels" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "discord_bots" ADD COLUMN IF NOT EXISTS "module_starboard" BOOLEAN NOT NULL DEFAULT false;
