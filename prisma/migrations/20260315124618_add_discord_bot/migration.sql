-- CreateTable
CREATE TABLE "discord_bots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Mon Super Bot',
    "token" TEXT,
    "prefix" TEXT NOT NULL DEFAULT '!',
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "module_moderation" BOOLEAN NOT NULL DEFAULT false,
    "module_tickets" BOOLEAN NOT NULL DEFAULT false,
    "module_welcome" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discord_bots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "discord_bots" ADD CONSTRAINT "discord_bots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
