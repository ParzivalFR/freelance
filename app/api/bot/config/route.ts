import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Délai max sans heartbeat avant de considérer le bot OFFLINE (90s)
const HEARTBEAT_TIMEOUT_MS = 90_000;

function computeStatus(bot: { status: string; lastHeartbeatAt?: Date | null }): string {
  if (bot.status !== "ONLINE") return bot.status;
  if (!bot.lastHeartbeatAt) return "OFFLINE";
  const elapsed = Date.now() - bot.lastHeartbeatAt.getTime();
  return elapsed > HEARTBEAT_TIMEOUT_MS ? "OFFLINE" : "ONLINE";
}

// GET — récupère le bot de l'utilisateur connecté
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    let bot = await prisma.discordBot.findFirst({
      where: { userId: session.user.id },
    });

    if (!bot) {
      bot = await prisma.discordBot.create({
        data: {
          userId: session.user.id,
          name: "Mon Super Bot",
          status: "OFFLINE",
        },
      });
    }

    // Statut calculé à partir du heartbeat
    const realStatus = computeStatus(bot);

    return NextResponse.json({ ...bot, status: realStatus });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH — met à jour la config du bot
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, token, prefix, moduleWelcome, moduleModeration, moduleTickets, moduleLevel, moduleLog, config, status, workerCommand } = body;

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // Vérifie que le bot appartient bien à l'utilisateur connecté
    const existing = await prisma.discordBot.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
    }

    const updated = await prisma.discordBot.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(token !== undefined && { token }),
        ...(prefix !== undefined && { prefix }),
        ...(moduleWelcome !== undefined && { moduleWelcome }),
        ...(moduleModeration !== undefined && { moduleModeration }),
        ...(moduleTickets !== undefined && { moduleTickets }),
        ...(moduleLevel !== undefined && { moduleLevel }),
        ...(moduleLog !== undefined && { moduleLog }),
        ...(config !== undefined && { config }),
        ...(status !== undefined && { status }),
        ...(workerCommand !== undefined && { workerCommand }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
