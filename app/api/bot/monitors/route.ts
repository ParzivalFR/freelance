import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");
  if (!botId) return NextResponse.json({ error: "botId manquant" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ monitors: [] });

  const monitors = await prisma.monitor.findMany({
    where: { botId: bot.id },
    orderBy: { createdAt: "asc" },
    include: {
      checks: { orderBy: { checkedAt: "desc" }, take: 90 },
      incidents: { where: { resolvedAt: null } },
    },
  });

  return NextResponse.json({ monitors });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { botId, name, type, target, interval, alertChannelId, alertRoleId } = body;

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const monitor = await prisma.monitor.create({
    data: {
      botId: bot.id,
      name,
      type,
      target,
      interval: interval ?? 5,
      alertChannelId: alertChannelId || null,
      alertRoleId: alertRoleId || null,
    },
  });

  return NextResponse.json({ monitor });
}
