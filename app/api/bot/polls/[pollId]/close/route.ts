import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/bot/polls/[pollId]/close
// Accepte : session dashboard OU x-bot-api-key (bot engine)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const { pollId } = await params;
  const apiKey = request.headers.get("x-bot-api-key");

  if (apiKey) {
    if (apiKey !== process.env.BOT_API_KEY) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  } else {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const owns = await prisma.poll.findFirst({
      where: { id: pollId, bot: { userId: session.user.id } },
      select: { id: true },
    });
    if (!owns) return NextResponse.json({ error: "Sondage introuvable" }, { status: 404 });
  }

  const poll = await prisma.poll.update({
    where: { id: pollId },
    data: { status: "CLOSED" },
    include: { votes: true },
  });

  return NextResponse.json(poll);
}
