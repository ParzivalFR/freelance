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

  try {
    const bot = await prisma.discordBot.findFirst({
      where: { userId: session.user.id },
    });

    if (!bot) {
      return NextResponse.json({ infractions: [], total: 0 });
    }

    const [infractions, total] = await Promise.all([
      prisma.infraction.findMany({
        where: { botId: bot.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.infraction.count({ where: { botId: bot.id } }),
    ]);

    return NextResponse.json({ infractions, total, page, limit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
