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
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status"); // "open" | "closed" | null

  if (!botId) {
    return NextResponse.json({ error: "botId manquant" }, { status: 400 });
  }

  try {
    const bot = await prisma.discordBot.findFirst({
      where: { id: botId, userId: session.user.id },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    const [tickets, total, openCount, closedCount] = await prisma.$transaction([
      prisma.ticket.findMany({
        where: { botId: bot.id, ...(status ? { status } : {}) },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.ticket.count({ where: { botId: bot.id, ...(status ? { status } : {}) } }),
      prisma.ticket.count({ where: { botId: bot.id, status: "open" } }),
      prisma.ticket.count({ where: { botId: bot.id, status: "closed" } }),
    ]);

    return NextResponse.json({
      tickets,
      total,
      stats: { open: openCount, closed: closedCount, avgResponseTime: null },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
