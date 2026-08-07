import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getOwnedBot(botId: string | null, userId: string) {
  if (!botId) return null;
  return prisma.discordBot.findFirst({ where: { id: botId, userId }, select: { id: true } });
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
