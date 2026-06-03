import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;
  const botId = searchParams.get("botId");

  try {
    if (!botId) {
      return NextResponse.json({ error: "botId manquant" }, { status: 400 });
    }

    // Vérifie que le bot appartient à l'utilisateur connecté
    const bot = await prisma.discordBot.findFirst({
      where: { id: botId, userId: session.user.id },
    });

    if (!bot) {
      return NextResponse.json({ infractions: [], total: 0 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [infractions, total, stats, last7daysRaw] = await Promise.all([
      prisma.infraction.findMany({
        where: { botId: bot.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.infraction.count({ where: { botId: bot.id } }),
      prisma.infraction.groupBy({
        by: ["type"],
        where: { botId: bot.id },
        _count: { type: true },
      }),
      prisma.infraction.findMany({
        where: { botId: bot.id, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

    return NextResponse.json({ infractions, total, page, limit, stats, last7daysRaw });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
