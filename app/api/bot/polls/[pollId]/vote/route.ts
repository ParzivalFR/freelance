import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST /api/bot/polls/[pollId]/vote
// Appelé par le bot-engine avec x-bot-api-key
export async function POST(
  request: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const apiKey = request.headers.get("x-bot-api-key");
  if (!apiKey || apiKey !== process.env.BOT_API_KEY) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { pollId } = await params;
  const body = await request.json().catch(() => ({}));
  const { userId, choices, weight } = body;

  if (!userId || !choices) {
    return NextResponse.json({ error: "userId et choices requis" }, { status: 400 });
  }

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    select: {
      id: true, status: true, allowChange: true,
      type: true, allowMultiple: true, maxChoices: true,
      allowedRoleIds: true, isBlind: true, minVotes: true,
    },
  });

  if (!poll) return NextResponse.json({ error: "Sondage introuvable" }, { status: 404 });
  if (poll.status !== "ACTIVE") return NextResponse.json({ error: "Sondage fermé" }, { status: 400 });

  // Vérification: nb de choix
  if (!poll.allowMultiple && Array.isArray(choices) && choices.length > 1) {
    return NextResponse.json({ error: "Un seul choix autorisé" }, { status: 400 });
  }
  if (poll.allowMultiple && Array.isArray(choices) && choices.length > poll.maxChoices) {
    return NextResponse.json({ error: `Maximum ${poll.maxChoices} choix` }, { status: 400 });
  }

  const existing = await prisma.pollVote.findUnique({
    where: { pollId_userId: { pollId, userId } },
  });

  if (existing && !poll.allowChange) {
    return NextResponse.json({ error: "Modification du vote non autorisée" }, { status: 403 });
  }

  const vote = await prisma.pollVote.upsert({
    where: { pollId_userId: { pollId, userId } },
    create: { pollId, userId, choices, weight: weight ?? 1 },
    update: { choices, weight: weight ?? 1, votedAt: new Date() },
  });

  // Récupérer le count pour savoir si minVotes est atteint
  const voteCount = await prisma.pollVote.count({ where: { pollId } });

  return NextResponse.json({
    vote,
    totalVotes: voteCount,
    resultsVisible: !poll.isBlind && voteCount >= poll.minVotes,
  });
}

// DELETE /api/bot/polls/[pollId]/vote — retrait du vote
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const apiKey = request.headers.get("x-bot-api-key");
  if (!apiKey || apiKey !== process.env.BOT_API_KEY) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { pollId } = await params;
  const { userId } = await request.json().catch(() => ({}));

  if (!userId) return NextResponse.json({ error: "userId requis" }, { status: 400 });

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    select: { status: true, allowChange: true },
  });

  if (!poll || poll.status !== "ACTIVE") {
    return NextResponse.json({ error: "Sondage fermé ou introuvable" }, { status: 400 });
  }
  if (!poll.allowChange) {
    return NextResponse.json({ error: "Modification du vote non autorisée" }, { status: 403 });
  }

  await prisma.pollVote.deleteMany({ where: { pollId, userId } });
  return NextResponse.json({ success: true });
}
