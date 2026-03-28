import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const HEARTBEAT_TIMEOUT_MS = 90_000;

function computeStatus(bot: { status: string; lastHeartbeatAt?: Date | null }): string {
  if (bot.status !== "ONLINE") return bot.status;
  if (!bot.lastHeartbeatAt) return "OFFLINE";
  return Date.now() - bot.lastHeartbeatAt.getTime() > HEARTBEAT_TIMEOUT_MS ? "OFFLINE" : "ONLINE";
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const bots = await prisma.discordBot.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const result = bots.map((bot) => ({
    ...bot,
    status: computeStatus(bot),
  }));

  return NextResponse.json(result);
}
