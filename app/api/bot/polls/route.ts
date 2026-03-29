import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/bot/polls?botId=x&page=1&limit=20&status=ACTIVE
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status");

  if (!botId) return NextResponse.json({ error: "botId requis" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
    select: { id: true },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const where = { botId, ...(status ? { status } : {}) };

  const [polls, total] = await Promise.all([
    prisma.poll.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { votes: true } } },
    }),
    prisma.poll.count({ where }),
  ]);

  return NextResponse.json({ polls, total, page, limit });
}

// POST /api/bot/polls
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    botId, guildId, channelId, title, description, type, options,
    isAnonymous, isBlind, allowMultiple, allowChange, maxChoices,
    allowedRoleIds, roleWeights, minVotes, autoThread,
    startsAt, endsAt, isRecurring, recurInterval,
    color, colorClosed, useEmbed,
  } = body;

  if (!botId || !guildId || !channelId || !title || !options?.length) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
    select: { id: true },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const isPending = startsAt && new Date(startsAt) > new Date();

  const poll = await prisma.poll.create({
    data: {
      botId,
      guildId,
      channelId,
      title,
      description: description || null,
      type: type ?? "MULTIPLE_CHOICE",
      options,
      isAnonymous: isAnonymous ?? false,
      isBlind: isBlind ?? false,
      allowMultiple: allowMultiple ?? false,
      allowChange: allowChange ?? true,
      maxChoices: maxChoices ?? 1,
      allowedRoleIds: allowedRoleIds ?? null,
      roleWeights: roleWeights ?? null,
      minVotes: minVotes ?? 0,
      autoThread: autoThread ?? false,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      isRecurring: isRecurring ?? false,
      recurInterval: recurInterval ?? null,
      color: color ?? null,
      colorClosed: colorClosed ?? null,
      useEmbed: useEmbed ?? true,
      status: isPending ? "PENDING" : "ACTIVE",
    },
  });

  return NextResponse.json(poll, { status: 201 });
}
