-- Création de la table afk_statuses pour la persistance des statuts AFK entre redémarrages
CREATE TABLE IF NOT EXISTS "afk_statuses" (
    "id"      TEXT NOT NULL,
    "bot_id"  TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason"  TEXT NOT NULL,
    "since"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "afk_statuses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "afk_statuses_bot_id_user_id_key" ON "afk_statuses"("bot_id", "user_id");
CREATE INDEX IF NOT EXISTS "afk_statuses_bot_id_idx" ON "afk_statuses"("bot_id");

-- Création de la table starboard_entries pour tracker les messages déjà postés (évite doublons après restart)
CREATE TABLE IF NOT EXISTS "starboard_entries" (
    "id"                   TEXT NOT NULL,
    "bot_id"               TEXT NOT NULL,
    "guild_id"             TEXT NOT NULL,
    "message_id"           TEXT NOT NULL,
    "starboard_message_id" TEXT NOT NULL,
    "star_count"           INTEGER NOT NULL DEFAULT 0,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "starboard_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "starboard_entries_bot_id_message_id_key" ON "starboard_entries"("bot_id", "message_id");
CREATE INDEX IF NOT EXISTS "starboard_entries_bot_id_idx" ON "starboard_entries"("bot_id");
