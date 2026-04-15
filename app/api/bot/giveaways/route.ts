import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/bot/giveaways?botId=x&status=ACTIVE
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");
  const status = searchParams.get("status");

  if (!botId) return NextResponse.json({ error: "botId requis" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
    select: { id: true },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const giveaways = await prisma.giveaway.findMany({
    where: { botId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(giveaways);
}

// POST /api/bot/giveaways
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const {
    botId, channelId, title, prize, description,
    mode, winnerCount, endAt, startAt,
    requiredRoleIds, minLevel, mustBeBooster, minDaysOnServer,
    useEmbed, embedColor, embedImage,
  } = body;

  if (!botId || !channelId || !title || !prize || !endAt) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
    select: { id: true, token: true },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  if (!bot.token) return NextResponse.json({ error: "Token bot manquant" }, { status: 400 });

  // Récupérer le guild automatiquement via l'API Discord
  const guildsRes = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: { Authorization: `Bot ${bot.token}` },
  });
  if (!guildsRes.ok) return NextResponse.json({ error: "Impossible de récupérer le serveur Discord" }, { status: 502 });

  const guilds = await guildsRes.json() as { id: string }[];
  if (!guilds.length) return NextResponse.json({ error: "Le bot n'est sur aucun serveur" }, { status: 400 });
  const guildId = guilds[0].id;

  const isPending = startAt && new Date(startAt) > new Date();

  const giveaway = await prisma.giveaway.create({
    data: {
      botId,
      guildId,
      channelId,
      title,
      prize,
      description: description || null,
      mode: mode ?? "RANDOM",
      winnerCount: winnerCount ?? 1,
      endAt: new Date(endAt),
      startAt: startAt ? new Date(startAt) : null,
      requiredRoleIds: requiredRoleIds ?? null,
      minLevel: minLevel ?? null,
      mustBeBooster: mustBeBooster ?? false,
      minDaysOnServer: minDaysOnServer ?? null,
      status: isPending ? "PENDING" : "ACTIVE",
      useEmbed: useEmbed ?? true,
      embedColor: embedColor || null,
      embedImage: embedImage || null,
    },
  });

  return NextResponse.json(giveaway, { status: 201 });
}
