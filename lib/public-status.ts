import { prisma } from "@/lib/prisma";

// Données de la page de statut publique d'un bot : utilisées par la page
// elle-même et par l'API JSON. Rien de privé n'en sort (cibles, canaux d'alerte).
export async function getPublicStatus(botId: string) {
  const bot = await prisma.discordBot.findUnique({
    where: { id: botId },
    select: { id: true, name: true, moduleMonitor: true },
  });

  if (!bot || !bot.moduleMonitor) {
    return null;
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const monitors = await prisma.monitor.findMany({
    where: { botId, active: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      lastCheckedAt: true,
      responseTime: true,
      checks: {
        orderBy: { checkedAt: "desc" },
        take: 90,
        select: { status: true, checkedAt: true, responseTime: true },
      },
      incidents: {
        where: {
          OR: [
            { startedAt: { gte: thirtyDaysAgo } },
            { resolvedAt: null },
          ],
        },
        orderBy: { startedAt: "desc" },
        select: { id: true, startedAt: true, resolvedAt: true },
      },
    },
  });

  const publicMonitors = monitors.map((m) => {
    const checksAll = m.checks;
    const checks7d = checksAll.filter(c => new Date(c.checkedAt) >= sevenDaysAgo);

    const uptime7d = checks7d.length > 0
      ? Math.round((checks7d.filter(c => c.status === "UP").length / checks7d.length) * 1000) / 10
      : null;

    const uptime30d = checksAll.length > 0
      ? Math.round((checksAll.filter(c => c.status === "UP").length / checksAll.length) * 1000) / 10
      : null;

    // Last 30 checks for the bar display
    const recentChecks = checksAll.slice(0, 30).map(c => ({
      status: c.status,
      checkedAt: c.checkedAt,
    }));

    return {
      id: m.id,
      name: m.name,
      type: m.type,
      status: m.status,
      lastCheckedAt: m.lastCheckedAt,
      responseTime: m.responseTime,
      uptime7d,
      uptime30d,
      recentChecks,
      incidents: m.incidents.map(i => ({
        id: i.id,
        startedAt: i.startedAt,
        resolvedAt: i.resolvedAt,
      })),
    };
  });

  const allUp = publicMonitors.every(m => m.status === "UP");
  const anyDown = publicMonitors.some(m => m.status === "DOWN");
  const globalStatus = anyDown ? "DOWN" : allUp ? "UP" : "PENDING";

  return {
    bot: { id: bot.id, name: bot.name },
    globalStatus,
    monitors: publicMonitors,
  };
}

export type PublicStatus = NonNullable<Awaited<ReturnType<typeof getPublicStatus>>>;
