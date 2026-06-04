// Script pour créer la table auto_responses
// Exécuter avec: npx tsx scripts/add-autoresponse-table.ts

import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS auto_responses (
      id TEXT PRIMARY KEY,
      bot_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      trigger TEXT NOT NULL,
      trigger_type TEXT NOT NULL DEFAULT 'contains',
      response TEXT NOT NULL,
      response_type TEXT NOT NULL DEFAULT 'text',
      embed_color TEXT,
      embed_title TEXT,
      case_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
      cooldown_seconds INTEGER NOT NULL DEFAULT 0,
      allowed_channel_ids JSONB NOT NULL DEFAULT '[]',
      ignored_role_ids JSONB NOT NULL DEFAULT '[]',
      delete_original BOOLEAN NOT NULL DEFAULT FALSE,
      reply_to_user BOOLEAN NOT NULL DEFAULT TRUE,
      trigger_count INTEGER NOT NULL DEFAULT 0,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS ar_bot_id_idx ON auto_responses(bot_id);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS ar_guild_id_idx ON auto_responses(guild_id);`);
  console.log("✅ Table auto_responses créée (ou déjà existante)");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ Erreur:", e);
  await prisma.$disconnect();
  process.exit(1);
});
