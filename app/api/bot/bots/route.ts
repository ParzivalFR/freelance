import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type DiscordBot = Awaited<ReturnType<typeof prisma.discordBot.findFirst>> & object;

const HEARTBEAT_TIMEOUT_MS = 90_000;

function computeStatus(bot: { status: string; lastHeartbeatAt?: Date | null }): string {
  if (bot.status !== "ONLINE") return bot.status;
  if (!bot.lastHeartbeatAt) return "OFFLINE";
  const elapsed = Date.now() - bot.lastHeartbeatAt.getTime();
  return elapsed > HEARTBEAT_TIMEOUT_MS ? "OFFLINE" : "ONLINE";
}

// GET — liste tous les bots de l'utilisateur connecté
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const bots = await prisma.discordBot.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });

    const botsWithStatus = bots.map((bot: DiscordBot) => ({
      ...bot,
      status: computeStatus(bot),
    }));

    return NextResponse.json(botsWithStatus);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — crée un nouveau bot pour l'utilisateur connecté
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const name = body.name ?? "Mon Super Bot";

    const bot = await prisma.discordBot.create({
      data: {
        userId: session.user.id,
        name,
        status: "OFFLINE",
      },
    });

    return NextResponse.json(bot, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
