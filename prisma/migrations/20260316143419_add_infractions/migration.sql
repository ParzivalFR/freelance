-- CreateTable
CREATE TABLE "infractions" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'Aucune raison fournie',
    "duration" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "infractions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "infractions" ADD CONSTRAINT "infractions_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "discord_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
