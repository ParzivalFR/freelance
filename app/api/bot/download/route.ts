import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdmZip from "adm-zip";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const BOT_ENGINE_PATH = path.join(process.cwd(), "..", "bot-engine");

function addDirToZip(zip: AdmZip, dirPath: string, zipPath: string) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (["node_modules", ".env", "dist", "generated"].includes(entry.name)) continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      addDirToZip(zip, fullPath, path.join(zipPath, entry.name));
    } else {
      zip.addLocalFile(fullPath, zipPath);
    }
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const bot = await prisma.discordBot.findFirst({
    where: { userId: session.user.id },
  });

  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  if (bot.plan !== "RAR") return NextResponse.json({ error: "Plan RAR requis" }, { status: 403 });

  const zip = new AdmZip();

  // ── Code source du bot-engine ──────────────────────────────────────────────
  addDirToZip(zip, path.join(BOT_ENGINE_PATH, "src"), "bot-engine/src");
  addDirToZip(zip, path.join(BOT_ENGINE_PATH, "prisma"), "bot-engine/prisma");

  for (const file of ["package.json", "tsconfig.json"]) {
    const filePath = path.join(BOT_ENGINE_PATH, file);
    if (fs.existsSync(filePath)) zip.addLocalFile(filePath, "bot-engine");
  }

  // ── config.json — config actuelle du client exportée ──────────────────────
  const configJson = JSON.stringify(
    {
      name: bot.name,
      prefix: bot.prefix,
      token: bot.token ?? "",
      modules: {
        welcome:    bot.moduleWelcome,
        moderation: bot.moduleModeration,
        tickets:    bot.moduleTickets,
      },
      config: bot.config ?? {},
    },
    null,
    2
  );
  zip.addFile("bot-engine/config.json", Buffer.from(configJson, "utf-8"));

  // ── .env.example ──────────────────────────────────────────────────────────
  const envExample = `# ──────────────────────────────────────────────
#  Configuration de ton bot Discord
#  Renomme ce fichier en ".env" et remplis les valeurs
# ──────────────────────────────────────────────

# Ta base de données PostgreSQL (Supabase, Railway, Neon, etc.)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# L'ID de ton bot en base de données
# Lance "pnpm setup" après avoir configuré DATABASE_URL pour l'obtenir
BOT_ID=
`;
  zip.addFile("bot-engine/.env.example", Buffer.from(envExample, "utf-8"));

  // ── Script setup.ts ────────────────────────────────────────────────────────
  const setupScript = `import "dotenv/config";
import { PrismaClient } from "./src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "./config.json";

async function setup() {
  console.log("\\n🚀 Setup du bot Discord\\n");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL manquant dans le fichier .env");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    // Crée un utilisateur placeholder si nécessaire
    const user = await prisma.user.upsert({
      where: { email: "bot-owner@local" },
      update: {},
      create: {
        email: "bot-owner@local",
        name: "Bot Owner",
      },
    });

    // Crée le bot avec la config exportée
    const bot = await prisma.discordBot.create({
      data: {
        userId: user.id,
        name: config.name,
        token: config.token,
        prefix: config.prefix,
        moduleWelcome: config.modules.welcome,
        moduleModeration: config.modules.moderation,
        moduleTickets: config.modules.tickets,
        config: config.config as any,
        status: "OFFLINE",
      },
    });

    console.log("✅ Bot créé avec succès !\\n");
    console.log("─────────────────────────────────");
    console.log(\`  BOT_ID = \${bot.id}\`);
    console.log("─────────────────────────────────");
    console.log("\\n👉 Copie ce BOT_ID dans ton fichier .env, puis lance : pnpm dev\\n");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Erreur setup:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

setup();
`;
  zip.addFile("bot-engine/setup.ts", Buffer.from(setupScript, "utf-8"));

  // ── README ─────────────────────────────────────────────────────────────────
  const activeModules = [
    bot.moduleWelcome    && "Welcome",
    bot.moduleModeration && "Modération",
    bot.moduleTickets    && "Tickets",
  ].filter(Boolean).join(", ") || "Aucun";

  const readme = `# ${bot.name} — Bot Discord
> Config exportée le ${new Date().toLocaleDateString("fr-FR")} • Modules actifs : ${activeModules}

---

## Prérequis

Avant de commencer, assure-toi d'avoir installé :

- **Node.js 18+** → https://nodejs.org (prends la version LTS)
- **pnpm** → ouvre un terminal et tape :
  \`\`\`bash
  npm install -g pnpm
  \`\`\`

---

## Étape 1 — Crée ta base de données PostgreSQL

Ton bot a besoin d'une base de données pour stocker sa configuration.
Voici les options gratuites recommandées :

### Option A — Supabase (recommandé, le plus simple)
1. Va sur https://supabase.com et crée un compte
2. Clique **"New project"**, donne un nom, choisis une région proche de toi
3. Une fois créé, va dans **Settings → Database → Connection string → URI**
4. Copie l'URL qui ressemble à :
   \`postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres\`

### Option B — Neon
1. Va sur https://neon.tech et crée un compte
2. Crée un nouveau projet
3. Copie la **Connection string** depuis le dashboard

---

## Étape 2 — Configure le fichier .env

1. Dans le dossier \`bot-engine/\`, renomme \`.env.example\` en \`.env\`
2. Ouvre \`.env\` et remplis \`DATABASE_URL\` avec l'URL copiée à l'étape 1 :

\`\`\`env
DATABASE_URL=postgresql://ton-url-ici
BOT_ID=   ← on remplira ça à l'étape 4
\`\`\`

---

## Étape 3 — Installe les dépendances et crée les tables

Ouvre un terminal dans le dossier \`bot-engine/\` et tape ces commandes dans l'ordre :

\`\`\`bash
# 1. Installe les packages Node.js
pnpm install

# 2. Crée les tables dans ta base de données
pnpm prisma migrate deploy

# 3. Génère le client Prisma (nécessaire pour que le code fonctionne)
pnpm prisma generate
\`\`\`

> **C'est quoi Prisma ?**
> Prisma est l'outil qui fait le lien entre le code et ta base de données.
> \`migrate deploy\` crée les tables nécessaires dans ta DB.
> \`generate\` crée le code TypeScript pour interagir avec ces tables.

---

## Étape 4 — Lance le script de setup

Ce script va créer ton bot dans ta base de données et te donner ton \`BOT_ID\` :

\`\`\`bash
pnpm tsx setup.ts
\`\`\`

Tu verras quelque chose comme :
\`\`\`
✅ Bot créé avec succès !
─────────────────────────────────
  BOT_ID = cma1b2c3d4e5f6g7h8i9j0
─────────────────────────────────
👉 Copie ce BOT_ID dans ton fichier .env
\`\`\`

Copie le \`BOT_ID\` affiché et colle-le dans ton \`.env\` :
\`\`\`env
DATABASE_URL=postgresql://...
BOT_ID=cma1b2c3d4e5f6g7h8i9j0   ← colle ici
\`\`\`

---

## Étape 5 — Lance le bot !

\`\`\`bash
pnpm dev
\`\`\`

Tu devrais voir :
\`\`\`
🤖 Démarrage du bot: "${bot.name}"
📦 Chargement des modules...
  ✅ Module "welcome" chargé
✅ Connecté en tant que: TonBot#1234
\`\`\`

Ton bot est maintenant en ligne sur ton serveur Discord ! 🎉

---

## Modifier la configuration

Toute la configuration est dans le fichier \`config.json\` :
- \`name\` → nom du bot
- \`prefix\` → préfixe des commandes (ex: \`!\`)
- \`token\` → token Discord de ton bot
- \`modules\` → activer/désactiver welcome, tickets, modération
- \`config\` → paramètres détaillés de chaque module (IDs des salons, messages, etc.)

Après modification, relance \`pnpm dev\` pour appliquer les changements.

---

## Héberger le bot 24/7

Pour que ton bot tourne en permanence sans laisser ton PC allumé :

| Service | Prix | Difficulté | Lien |
|---------|------|------------|------|
| **Railway** | ~5$/mois | ⭐ Très facile | https://railway.app |
| **Render** | Gratuit (avec limites) | ⭐⭐ Facile | https://render.com |
| **Hetzner VPS** | ~4€/mois | ⭐⭐⭐ Avancé | https://hetzner.com |

### Déployer sur Railway (recommandé)
1. Crée un compte sur https://railway.app
2. **New Project → Deploy from GitHub** (push ton dossier bot-engine sur GitHub d'abord)
3. Ajoute les variables d'environnement (\`DATABASE_URL\` et \`BOT_ID\`) dans les settings
4. Railway détecte automatiquement le \`package.json\` et lance \`pnpm start\`

---

## Problèmes fréquents

**Le bot ne démarre pas / erreur de connexion DB**
→ Vérifie que \`DATABASE_URL\` est correct et que tu as bien lancé \`pnpm prisma migrate deploy\`

**"BOT_ID manquant"**
→ Tu n'as pas rempli \`BOT_ID\` dans \`.env\`. Lance \`pnpm tsx setup.ts\` pour l'obtenir.

**"Cannot find module './generated/client'"**
→ Tu n'as pas lancé \`pnpm prisma generate\`. Lance-le et réessaie.

**Le bot est en ligne mais ne répond pas**
→ Vérifie que tu as bien invité le bot sur ton serveur avec les bonnes permissions
  et que les **Privileged Intents** sont activés sur le portail développeur Discord.

---

*Pour toute question ou problème, contacte le support.*
`;
  zip.addFile("bot-engine/README.md", Buffer.from(readme, "utf-8"));

  const zipBuffer = zip.toBuffer();
  const filename = `${bot.name.replace(/\s+/g, "-").toLowerCase()}-bot.zip`;

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
