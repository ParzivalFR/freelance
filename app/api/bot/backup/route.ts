import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfNeeded } from "@/lib/monitor-crypto";
import { captureSnapshot } from "@/lib/server-backup";
import { NextResponse } from "next/server";

const MAX_BACKUPS_PER_BOT = 5;

async function getOwnedBot(botId: string | null, userId: string) {
  if (!botId) return null;
  return prisma.discordBot.findFirst({ where: { id: botId, userId }, select: { id: true } });
}

// POST — créer une sauvegarde de la structure actuelle
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { botId, name } = (await request.json().catch(() => ({}))) as { botId?: string; name?: string };
  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
    select: { id: true, token: true, config: true },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  if (!bot.token) return NextResponse.json({ error: "Token bot manquant" }, { status: 400 });

  const guildId = (bot.config as { guildId?: string } | null)?.guildId;
  if (!guildId) return NextResponse.json({ error: "guildId non configuré sur ce bot" }, { status: 400 });

  let snapshot;
  try {
    snapshot = await captureSnapshot(guildId, decryptIfNeeded(bot.token));
  } catch {
    return NextResponse.json({ error: "Impossible de contacter l'API Discord" }, { status: 502 });
  }

  const created = await prisma.serverBackup.create({
    data: { botId: bot.id, guildId, name: name || undefined, createdBy: session.user.id, snapshot: snapshot as unknown as object },
  });

  const all = await prisma.serverBackup.findMany({
    where: { botId: bot.id, guildId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  const toDelete = all.slice(MAX_BACKUPS_PER_BOT).map((b) => b.id);
  if (toDelete.length > 0) await prisma.serverBackup.deleteMany({ where: { id: { in: toDelete } } });

  return NextResponse.json({
    id: created.id,
    name: created.name,
    createdAt: created.createdAt,
    roleCount: snapshot.roles.length,
    categoryCount: snapshot.categories.length,
    channelCount: snapshot.channels.length,
  });
}

// GET — liste des sauvegardes du bot
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");

  const bot = await getOwnedBot(botId, session.user.id);
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const backups = await prisma.serverBackup.findMany({
    where: { botId: bot.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdBy: true, createdAt: true, snapshot: true },
  });

  const summarized = backups.map((b) => {
    const snap = b.snapshot as { roles?: unknown[]; categories?: unknown[]; channels?: unknown[] };
    return {
      id: b.id,
      name: b.name,
      createdBy: b.createdBy,
      createdAt: b.createdAt,
      roleCount: snap.roles?.length ?? 0,
      categoryCount: snap.categories?.length ?? 0,
      channelCount: snap.channels?.length ?? 0,
    };
  });

  return NextResponse.json(summarized);
}

// DELETE — supprimer une sauvegarde
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const botId = searchParams.get("botId");
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const bot = await getOwnedBot(botId, session.user.id);
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const existing = await prisma.serverBackup.findFirst({ where: { id, botId: bot.id } });
  if (!existing) return NextResponse.json({ error: "Sauvegarde introuvable" }, { status: 404 });

  await prisma.serverBackup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
