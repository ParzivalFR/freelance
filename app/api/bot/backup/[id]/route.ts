import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — détail complet d'une sauvegarde (rôles, catégories, salons)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");

  const bot = await prisma.discordBot.findFirst({ where: { id: botId ?? undefined, userId: session.user.id }, select: { id: true } });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const backup = await prisma.serverBackup.findFirst({ where: { id, botId: bot.id } });
  if (!backup) return NextResponse.json({ error: "Sauvegarde introuvable" }, { status: 404 });

  return NextResponse.json({ id: backup.id, name: backup.name, createdAt: backup.createdAt, snapshot: backup.snapshot });
}
