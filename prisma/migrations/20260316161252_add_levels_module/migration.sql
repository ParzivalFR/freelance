-- AlterTable
ALTER TABLE "discord_bots" ADD COLUMN     "module_level" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_levels" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "last_xp_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_rewards" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "level_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_levels_bot_id_user_id_guild_id_key" ON "user_levels"("bot_id", "user_id", "guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "level_rewards_bot_id_level_key" ON "level_rewards"("bot_id", "level");

-- AddForeignKey
ALTER TABLE "user_levels" ADD CONSTRAINT "user_levels_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "discord_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_rewards" ADD CONSTRAINT "level_rewards_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "discord_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
