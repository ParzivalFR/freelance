import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfNeeded } from "@/lib/monitor-crypto";
import { restoreSnapshot, type Snapshot } from "@/lib/server-backup";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { botId, backupId } = (await request.json().catch(() => ({}))) as { botId?: string; backupId?: string };
  if (!backupId) return NextResponse.json({ error: "backupId manquant" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
    select: { id: true, token: true, config: true },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  if (!bot.token) return NextResponse.json({ error: "Token bot manquant" }, { status: 400 });

  const guildId = (bot.config as { guildId?: string } | null)?.guildId;
  if (!guildId) return NextResponse.json({ error: "guildId non configuré sur ce bot" }, { status: 400 });

  const backup = await prisma.serverBackup.findFirst({ where: { id: backupId, botId: bot.id } });
  if (!backup) return NextResponse.json({ error: "Sauvegarde introuvable" }, { status: 404 });

  const result = await restoreSnapshot(guildId, decryptIfNeeded(bot.token), backup.snapshot as unknown as Snapshot);

  return NextResponse.json(result);
}
