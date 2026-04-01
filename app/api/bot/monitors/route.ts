import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/monitor-crypto";
import { NextResponse } from "next/server";

const DB_TYPES = ["POSTGRES", "MYSQL", "MARIADB"];

function sanitizeTarget(type: string): string {
  if (DB_TYPES.includes(type)) return `[${type} — connexion chiffrée]`;
  return "";
}

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

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const monitors = await prisma.monitor.findMany({
    where: { botId: bot.id },
    orderBy: { createdAt: "asc" },
    include: {
      checks: { orderBy: { checkedAt: "desc" }, take: 90 },
      incidents: {
        where: {
          OR: [
            { startedAt: { gte: thirtyDaysAgo } },
            { resolvedAt: null },
          ],
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  const sanitized = monitors.map((m) => ({
    ...m,
    target: DB_TYPES.includes(m.type) ? sanitizeTarget(m.type) : m.target,
    // Never expose SSH credentials — replace with a boolean flag
    sshConfig: m.sshConfig ? true : null,
  }));

  return NextResponse.json({ monitors: sanitized });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { botId, name, type, target, sshConfig, interval, alertChannelId, alertRoleId } = body;

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const storedTarget = DB_TYPES.includes(type) ? encrypt(target) : target;
  const storedSsh = sshConfig ? encrypt(JSON.stringify(sshConfig)) : null;

  const monitor = await prisma.monitor.create({
    data: {
      botId: bot.id,
      name,
      type,
      target: storedTarget,
      sshConfig: storedSsh,
      interval: interval ?? 5,
      alertChannelId: alertChannelId || null,
      alertRoleId: alertRoleId || null,
    },
  });

  return NextResponse.json({
    monitor: {
      ...monitor,
      target: DB_TYPES.includes(type) ? sanitizeTarget(type) : target,
      sshConfig: storedSsh ? true : null,
    },
  });
}
