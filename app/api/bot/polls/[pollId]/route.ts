import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type PollOption = { id: string; label: string; emoji?: string };
type RankedChoice = { optionId: string; rank: number };

function computeAnalytics(poll: {
  type: string;
  options: unknown;
  votes: Array<{ choices: unknown; weight: number; userId: string }>;
}) {
  const options = poll.options as PollOption[];
  const votes = poll.votes;
  const totalVoters = votes.length;

  if (poll.type === "RANKED") {
    const n = options.length;
    const scores: Record<string, number> = {};
    options.forEach((o) => { scores[o.id] = 0; });

    votes.forEach((vote) => {
      const choices = vote.choices as RankedChoice[];
      choices.forEach(({ optionId, rank }) => {
        if (scores[optionId] !== undefined) {
          scores[optionId] += (n - rank) * vote.weight;
        }
      });
    });

    const maxScore = Math.max(1, ...Object.values(scores));
    return {
      type: "RANKED",
      totalVoters,
      results: options
        .map((o) => ({
          optionId: o.id,
          label: o.label,
          emoji: o.emoji,
          bordaScore: Math.round(scores[o.id] ?? 0),
          percentage: Math.round(((scores[o.id] ?? 0) / maxScore) * 100),
        }))
        .sort((a, b) => b.bordaScore - a.bordaScore),
    };
  }

  // MULTIPLE_CHOICE | YES_NO
  const counts: Record<string, number> = {};
  const weighted: Record<string, number> = {};
  options.forEach((o) => { counts[o.id] = 0; weighted[o.id] = 0; });

  votes.forEach((vote) => {
    const choices = vote.choices as string[];
    choices.forEach((optionId) => {
      if (counts[optionId] !== undefined) {
        counts[optionId] += 1;
        weighted[optionId] += vote.weight;
      }
    });
  });

  const totalWeighted = votes.reduce((s, v) => s + v.weight, 0);
  const maxWeighted = Math.max(1, ...Object.values(weighted));

  return {
    type: poll.type,
    totalVoters,
    totalWeightedVotes: Math.round(totalWeighted * 10) / 10,
    results: options
      .map((o) => ({
        optionId: o.id,
        label: o.label,
        emoji: o.emoji,
        votes: counts[o.id] ?? 0,
        weightedVotes: Math.round((weighted[o.id] ?? 0) * 10) / 10,
        percentage: totalVoters === 0 ? 0 : Math.round(((counts[o.id] ?? 0) / totalVoters) * 100),
        weightedPercentage: Math.round(((weighted[o.id] ?? 0) / maxWeighted) * 100),
      }))
      .sort((a, b) => b.weightedVotes - a.weightedVotes),
  };
}

// GET /api/bot/polls/[pollId]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { pollId } = await params;
  const poll = await prisma.poll.findFirst({
    where: { id: pollId, bot: { userId: session.user.id } },
    include: { votes: true },
  });
  if (!poll) return NextResponse.json({ error: "Sondage introuvable" }, { status: 404 });

  const analytics = computeAnalytics(poll);
  const { votes, ...pollData } = poll;
  const safeVotes = poll.isAnonymous ? [] : votes;

  return NextResponse.json({ ...pollData, analytics, votes: safeVotes });
}

// PATCH /api/bot/polls/[pollId] — messageId, threadId, status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { pollId } = await params;
  const exists = await prisma.poll.findFirst({
    where: { id: pollId, bot: { userId: session.user.id } },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Sondage introuvable" }, { status: 404 });

  const { messageId, threadId, status } = await request.json().catch(() => ({}));

  const updated = await prisma.poll.update({
    where: { id: pollId },
    data: {
      ...(messageId !== undefined && { messageId }),
      ...(threadId !== undefined && { threadId }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/bot/polls/[pollId]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { pollId } = await params;
  const exists = await prisma.poll.findFirst({
    where: { id: pollId, bot: { userId: session.user.id } },
    select: { id: true },
  });
  if (!exists) return NextResponse.json({ error: "Sondage introuvable" }, { status: 404 });

  await prisma.poll.delete({ where: { id: pollId } });
  return NextResponse.json({ success: true });
}
