-- Rattrapage : tout ce qui a été créé en SQL manuel depuis la dernière
-- migration enregistrée. Déjà présent en production : cette migration y est
-- marquée comme appliquée (migrate resolve), elle ne s'exécute que sur une
-- base neuve.

-- AlterTable
ALTER TABLE "public"."clients" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."discord_bots" ADD COLUMN     "module_afk" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_aibuild" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_announce_command" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_antinuke" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_applications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_autoresponse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_backup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_birthday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_booster" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_economy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_giveaway" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_invites" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_monitor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_profiles" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_quests" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_reaction_roles" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_reminders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_scheduler" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_suggestions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "module_teams" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."application_forms" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "review_channel_id" TEXT,
    "accept_role_id" TEXT,
    "reject_dm_message" TEXT,
    "accept_dm_message" TEXT,
    "color" TEXT DEFAULT '#5865f2',
    "channel_id" TEXT,
    "message_id" TEXT,
    "max_submissions" INTEGER DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."application_submissions" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewer_id" TEXT,
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."auto_responses" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "trigger_type" TEXT NOT NULL DEFAULT 'contains',
    "response" TEXT NOT NULL,
    "response_type" TEXT NOT NULL DEFAULT 'text',
    "embed_color" TEXT,
    "embed_title" TEXT,
    "case_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "cooldown_seconds" INTEGER NOT NULL DEFAULT 0,
    "allowed_channel_ids" JSONB NOT NULL DEFAULT '[]',
    "ignored_role_ids" JSONB NOT NULL DEFAULT '[]',
    "delete_original" BOOLEAN NOT NULL DEFAULT false,
    "reply_to_user" BOOLEAN NOT NULL DEFAULT true,
    "trigger_count" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auto_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."birthdays" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_remove_at" TIMESTAMP(3),

    CONSTRAINT "birthdays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bot_commands" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumed_at" TIMESTAMP(3),

    CONSTRAINT "bot_commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bot_logs" (
    "id" BIGSERIAL NOT NULL,
    "bot_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."briefs" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "client_id" TEXT,
    "answers" JSONB,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "email_sent_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."economy_transactions" (
    "id" BIGSERIAL NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "from_user_id" TEXT,
    "to_user_id" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "economy_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."economy_wallets" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "bank" BIGINT NOT NULL DEFAULT 0,
    "total_earned" BIGINT NOT NULL DEFAULT 0,
    "last_daily" TIMESTAMPTZ(6),
    "last_weekly" TIMESTAMPTZ(6),
    "last_work" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "economy_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_locks" (
    "key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_locks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."giveaways" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT,
    "title" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "description" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'RANDOM',
    "winner_count" INTEGER NOT NULL DEFAULT 1,
    "required_role_ids" JSONB,
    "min_level" INTEGER,
    "must_be_booster" BOOLEAN NOT NULL DEFAULT false,
    "min_days_on_server" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3) NOT NULL,
    "winner_ids" JSONB,
    "participant_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "participants" JSONB,
    "embed_color" TEXT,
    "embed_image" TEXT,
    "use_embed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invite_bonuses" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "inviter_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "granted_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invite_joins" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "inviter_id" TEXT,
    "code" TEXT,
    "is_fake" BOOLEAN NOT NULL DEFAULT false,
    "is_left" BOOLEAN NOT NULL DEFAULT false,
    "account_age_days" INTEGER,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "source_label" TEXT,

    CONSTRAINT "invite_joins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_profiles" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "specialties" JSONB NOT NULL DEFAULT '[]',
    "quest_types" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rate" TEXT,
    "portfolio" TEXT,
    "contact" TEXT,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monitor_checks" (
    "id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "response_time" INTEGER,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitor_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monitor_incidents" (
    "id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "monitor_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monitors" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "last_checked_at" TIMESTAMP(3),
    "response_time" INTEGER,
    "alert_channel_id" TEXT,
    "alert_role_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ssh_config" TEXT,

    CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profile_reviews" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quest_applications" (
    "id" TEXT NOT NULL,
    "quest_id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "link" TEXT,
    "is_maitre" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quest_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quests" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "author_avatar" TEXT,
    "type" TEXT NOT NULL,
    "nature" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" TEXT,
    "deadline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "selected_user_id" TEXT,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reaction_role_panels" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT,
    "message_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'toggle',
    "buttons" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reaction_role_panels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refund_requests" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "stripe_refund_id" TEXT,
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "refund_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reminders" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "remind_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scheduled_messages" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cron_expression" TEXT,
    "next_run" TIMESTAMPTZ(6),
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."server_backups" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "name" TEXT,
    "created_by" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "server_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."server_generations" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "server_type" TEXT,
    "concept" TEXT,
    "style" TEXT,
    "complexity" TEXT,
    "structure" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_at" TIMESTAMPTZ(6),

    CONSTRAINT "server_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."suggestions" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "upvotes" JSONB NOT NULL DEFAULT '[]',
    "downvotes" JSONB NOT NULL DEFAULT '[]',
    "message_id" TEXT,
    "response" TEXT,
    "responded_by" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "motivation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_projects" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "author_avatar" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "profiles_needed" TEXT,
    "nature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "selected_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."temp_channels" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temp_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tickets" (
    "id" TEXT NOT NULL,
    "bot_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "claimed_by" TEXT,
    "rating" INTEGER,
    "closed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "af_bot_id_idx" ON "public"."application_forms"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "as_bot_id_idx" ON "public"."application_submissions"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "as_form_id_idx" ON "public"."application_submissions"("form_id" ASC);

-- CreateIndex
CREATE INDEX "ar_bot_id_idx" ON "public"."auto_responses"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "ar_guild_id_idx" ON "public"."auto_responses"("guild_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "bd_bot_guild_user_idx" ON "public"."birthdays"("bot_id" ASC, "guild_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "bd_day_month_idx" ON "public"."birthdays"("month" ASC, "day" ASC);

-- CreateIndex
CREATE INDEX "birthdays_role_remove_at_idx" ON "public"."birthdays"("role_remove_at" ASC);

-- CreateIndex
CREATE INDEX "bot_commands_bot_id_consumed_at_idx" ON "public"."bot_commands"("bot_id" ASC, "consumed_at" ASC);

-- CreateIndex
CREATE INDEX "bot_logs_bot_id_idx" ON "public"."bot_logs"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "bot_logs_created_at_idx" ON "public"."bot_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "briefs_status_idx" ON "public"."briefs"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "briefs_token_key" ON "public"."briefs"("token" ASC);

-- CreateIndex
CREATE INDEX "et_bot_id_idx" ON "public"."economy_transactions"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "et_to_user_idx" ON "public"."economy_transactions"("to_user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ew_bot_guild_user_idx" ON "public"."economy_wallets"("bot_id" ASC, "guild_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "ew_bot_id_idx" ON "public"."economy_wallets"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "event_locks_created_at_idx" ON "public"."event_locks"("created_at" ASC);

-- CreateIndex
CREATE INDEX "invite_bonuses_bot_id_guild_id_inviter_id_idx" ON "public"."invite_bonuses"("bot_id" ASC, "guild_id" ASC, "inviter_id" ASC);

-- CreateIndex
CREATE INDEX "invite_joins_bot_id_guild_id_inviter_id_idx" ON "public"."invite_joins"("bot_id" ASC, "guild_id" ASC, "inviter_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "invite_joins_bot_id_guild_id_user_id_key" ON "public"."invite_joins"("bot_id" ASC, "guild_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "member_profiles_bot_id_guild_id_user_id_key" ON "public"."member_profiles"("bot_id" ASC, "guild_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "member_profiles_bot_id_idx" ON "public"."member_profiles"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "profile_reviews_profile_id_idx" ON "public"."profile_reviews"("profile_id" ASC);

-- CreateIndex
CREATE INDEX "quest_applications_quest_id_idx" ON "public"."quest_applications"("quest_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "quest_applications_quest_id_user_id_key" ON "public"."quest_applications"("quest_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "quests_bot_id_idx" ON "public"."quests"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "quests_guild_id_status_idx" ON "public"."quests"("guild_id" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "rrp_bot_id_idx" ON "public"."reaction_role_panels"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "reminders_remind_at_idx" ON "public"."reminders"("remind_at" ASC);

-- CreateIndex
CREATE INDEX "sm_bot_id_idx" ON "public"."scheduled_messages"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "sm_next_run_idx" ON "public"."scheduled_messages"("next_run" ASC);

-- CreateIndex
CREATE INDEX "server_backups_bot_id_guild_id_idx" ON "public"."server_backups"("bot_id" ASC, "guild_id" ASC);

-- CreateIndex
CREATE INDEX "sgen_bot_id_idx" ON "public"."server_generations"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "sgen_created_at_idx" ON "public"."server_generations"("created_at" DESC);

-- CreateIndex
CREATE INDEX "sgen_guild_id_idx" ON "public"."server_generations"("guild_id" ASC);

-- CreateIndex
CREATE INDEX "sg_bot_id_idx" ON "public"."suggestions"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "team_members_team_id_idx" ON "public"."team_members"("team_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "public"."team_members"("team_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "team_projects_bot_id_idx" ON "public"."team_projects"("bot_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "temp_channels_bot_id_channel_id_key" ON "public"."temp_channels"("bot_id" ASC, "channel_id" ASC);

-- CreateIndex
CREATE INDEX "tickets_bot_id_idx" ON "public"."tickets"("bot_id" ASC);

-- CreateIndex
CREATE INDEX "tickets_guild_status_idx" ON "public"."tickets"("guild_id" ASC, "status" ASC);

-- AddForeignKey
ALTER TABLE "public"."giveaways" ADD CONSTRAINT "giveaways_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."discord_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monitor_checks" ADD CONSTRAINT "monitor_checks_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monitor_incidents" ADD CONSTRAINT "monitor_incidents_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monitors" ADD CONSTRAINT "monitors_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."discord_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profile_reviews" ADD CONSTRAINT "profile_reviews_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quest_applications" ADD CONSTRAINT "quest_applications_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refund_requests" ADD CONSTRAINT "refund_requests_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."discord_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refund_requests" ADD CONSTRAINT "refund_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reminders" ADD CONSTRAINT "reminders_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."discord_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."server_backups" ADD CONSTRAINT "server_backups_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."discord_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."team_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."temp_channels" ADD CONSTRAINT "temp_channels_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."discord_bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
