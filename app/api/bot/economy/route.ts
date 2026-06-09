import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "botId manquant" }, { status: 400 });
  }

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });

  if (!bot) {
    return NextResponse.json({ wallets: [], stats: { totalCoins: 0, activeMembers: 0 } });
  }
  if (bot.plan !== "PRO" && bot.plan !== "MANAGED") {
    return NextResponse.json({ error: "Abonnement PRO requis." }, { status: 403 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [wallets, activeMembers] = await Promise.all([
    prisma.economyWallet.findMany({
      where: { botId: bot.id },
      orderBy: { balance: "desc" },
      take: 20,
    }),
    prisma.economyWallet.count({
      where: {
        botId: bot.id,
        updatedAt: { gte: sevenDaysAgo },
      },
    }),
  ]);

  const totalCoins = wallets.reduce((acc, w) => acc + Number(w.balance) + Number(w.bank), 0);

  return NextResponse.json({
    wallets: wallets.map((w) => ({
      id: w.id,
      userId: w.userId,
      guildId: w.guildId,
      balance: Number(w.balance),
      bank: Number(w.bank),
      totalEarned: Number(w.totalEarned),
      lastDaily: w.lastDaily,
      lastWeekly: w.lastWeekly,
      lastWork: w.lastWork,
      updatedAt: w.updatedAt,
    })),
    stats: {
      totalCoins,
      activeMembers,
      totalMembers: wallets.length,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { botId, action, userId, guildId, amount } = body;

  if (!botId || !action) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });

  if (!bot) {
    return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  }
  if (bot.plan !== "PRO" && bot.plan !== "MANAGED") {
    return NextResponse.json({ error: "Abonnement PRO requis." }, { status: 403 });
  }

  if (action === "give") {
    if (!userId || !guildId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "userId, guildId et amount requis" }, { status: 400 });
    }

    await prisma.economyWallet.upsert({
      where: { botId_guildId_userId: { botId, guildId, userId } },
      create: { botId, guildId, userId, balance: BigInt(amount), totalEarned: BigInt(amount) },
      update: { balance: { increment: BigInt(amount) }, totalEarned: { increment: BigInt(amount) } },
    });

    return NextResponse.json({ success: true });
  }

  if (action === "reset") {
    if (!userId || !guildId) {
      return NextResponse.json({ error: "userId et guildId requis" }, { status: 400 });
    }

    await prisma.economyWallet.deleteMany({
      where: { botId, guildId, userId },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
