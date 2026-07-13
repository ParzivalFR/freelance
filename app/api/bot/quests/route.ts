import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");
  if (!botId)
    return NextResponse.json({ error: "botId manquant" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
    select: { id: true },
  });
  if (!bot)
    return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const quests = await prisma.quest.findMany({
    where: { botId },
    include: { applications: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(quests);
}
