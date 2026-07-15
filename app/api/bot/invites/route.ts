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
    select: { id: true, config: true },
  });
  if (!bot)
    return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const guildId = ((bot.config ?? {}) as { guildId?: string }).guildId;
  if (!guildId) return NextResponse.json([]);

  const [regularRows, leftRows, fakeRows, bonusRows] = await Promise.all([
    prisma.inviteJoin.groupBy({
      by: ["inviterId"],
      where: { botId, guildId, inviterId: { not: null }, isFake: false, isLeft: false },
      _count: { inviterId: true },
    }),
    prisma.inviteJoin.groupBy({
      by: ["inviterId"],
      where: { botId, guildId, inviterId: { not: null }, isFake: false, isLeft: true },
      _count: { inviterId: true },
    }),
    prisma.inviteJoin.groupBy({
      by: ["inviterId"],
      where: { botId, guildId, inviterId: { not: null }, isFake: true },
      _count: { inviterId: true },
    }),
    prisma.inviteBonus.groupBy({
      by: ["inviterId"],
      where: { botId, guildId },
      _sum: { amount: true },
    }),
  ]);

  const map = new Map<string, { regular: number; left: number; fake: number; bonus: number }>();
  const ensure = (id: string) => {
    if (!map.has(id)) map.set(id, { regular: 0, left: 0, fake: 0, bonus: 0 });
    return map.get(id)!;
  };
  for (const r of regularRows) if (r.inviterId) ensure(r.inviterId).regular = r._count.inviterId;
  for (const r of leftRows) if (r.inviterId) ensure(r.inviterId).left = r._count.inviterId;
  for (const r of fakeRows) if (r.inviterId) ensure(r.inviterId).fake = r._count.inviterId;
  for (const r of bonusRows) ensure(r.inviterId).bonus = r._sum.amount ?? 0;

  const leaderboard = Array.from(map.entries())
    .map(([userId, stats]) => ({ userId, ...stats, score: stats.regular + stats.bonus }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return NextResponse.json(leaderboard);
}
