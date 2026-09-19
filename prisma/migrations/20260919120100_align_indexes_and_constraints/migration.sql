-- AlterTable
ALTER TABLE "application_forms" ALTER COLUMN "max_submissions" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "birthdays" ADD CONSTRAINT "birthdays_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "discord_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "af_bot_id_idx" RENAME TO "application_forms_bot_id_idx";

-- RenameIndex
ALTER INDEX "as_bot_id_idx" RENAME TO "application_submissions_bot_id_idx";

-- RenameIndex
ALTER INDEX "as_form_id_idx" RENAME TO "application_submissions_form_id_idx";

-- RenameIndex
ALTER INDEX "ar_bot_id_idx" RENAME TO "auto_responses_bot_id_idx";

-- RenameIndex
ALTER INDEX "ar_guild_id_idx" RENAME TO "auto_responses_guild_id_idx";

-- RenameIndex
ALTER INDEX "bd_bot_guild_user_idx" RENAME TO "birthdays_bot_id_guild_id_user_id_key";

-- RenameIndex
ALTER INDEX "bd_day_month_idx" RENAME TO "birthdays_month_day_idx";

-- RenameIndex
ALTER INDEX "ew_bot_guild_user_idx" RENAME TO "economy_wallets_bot_id_guild_id_user_id_key";

-- RenameIndex
ALTER INDEX "ew_bot_id_idx" RENAME TO "economy_wallets_bot_id_idx";

-- RenameIndex
ALTER INDEX "rrp_bot_id_idx" RENAME TO "reaction_role_panels_bot_id_idx";

-- RenameIndex
ALTER INDEX "sm_bot_id_idx" RENAME TO "scheduled_messages_bot_id_idx";

-- RenameIndex
ALTER INDEX "sm_next_run_idx" RENAME TO "scheduled_messages_next_run_idx";

-- RenameIndex
ALTER INDEX "sgen_bot_id_idx" RENAME TO "server_generations_bot_id_idx";

-- RenameIndex
ALTER INDEX "sgen_guild_id_idx" RENAME TO "server_generations_guild_id_idx";

-- RenameIndex
ALTER INDEX "sg_bot_id_idx" RENAME TO "suggestions_bot_id_idx";

-- RenameIndex
ALTER INDEX "tickets_guild_status_idx" RENAME TO "tickets_guild_id_status_idx";
