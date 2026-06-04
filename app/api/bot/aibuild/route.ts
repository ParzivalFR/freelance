import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");
  if (!botId) return NextResponse.json({ error: "botId manquant" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const generations = await prisma.serverGeneration.findMany({
    where: { botId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Calcul des stats
  const total = generations.length;
  const applied = generations.filter((g) => g.status === "applied").length;
  const cancelled = generations.filter((g) => g.status === "cancelled").length;
  const pending = generations.filter((g) => g.status === "pending").length;

  // Quota actuel
  const PLAN_QUOTAS: Record<string, { limit: number; windowDays: number }> = {
    FREE: { limit: 1, windowDays: 36500 },
    PRO: { limit: 3, windowDays: 7 },
    MANAGED: { limit: 999, windowDays: 7 },
  };
  const planKey = bot.plan ?? "FREE";
  const quota = PLAN_QUOTAS[planKey] ?? PLAN_QUOTAS.FREE;
  const since = new Date(Date.now() - quota.windowDays * 86400_000);
  const used = await prisma.serverGeneration.count({
    where: { botId, status: "applied", appliedAt: { gte: since } },
  });
  const resetDate = new Date(since.getTime() + quota.windowDays * 86400_000);

  return NextResponse.json({
    generations,
    stats: { total, applied, cancelled, pending },
    quota: { used, limit: quota.limit, resetDate },
  });
}
