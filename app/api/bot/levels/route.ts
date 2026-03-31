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
  const skip = (page - 1) * limit;

  if (!botId) {
    return NextResponse.json({ error: "botId manquant" }, { status: 400 });
  }

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });

  if (!bot) {
    return NextResponse.json({ levels: [], total: 0 });
  }

  const [levels, total] = await Promise.all([
    prisma.userLevel.findMany({
      where: { botId: bot.id },
      orderBy: { xp: "desc" },
      skip,
      take: limit,
    }),
    prisma.userLevel.count({ where: { botId: bot.id } }),
  ]);

  return NextResponse.json({ levels, total, page, limit });
}
