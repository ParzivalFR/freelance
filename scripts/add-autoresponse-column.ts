// Script pour ajouter la colonne module_autoresponse à discord_bots
// Exécuter avec: npx tsx scripts/add-autoresponse-column.ts

import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE discord_bots
    ADD COLUMN IF NOT EXISTS module_autoresponse BOOLEAN NOT NULL DEFAULT FALSE;
  `);
  console.log("✅ Colonne module_autoresponse ajoutée (ou déjà existante)");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("❌ Erreur:", e);
  await prisma.$disconnect();
  process.exit(1);
});
