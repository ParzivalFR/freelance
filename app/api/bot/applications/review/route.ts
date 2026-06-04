import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Accepter ou refuser une candidature depuis le dashboard
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { submissionId, action } = body;
  if (!submissionId || !["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Champs invalides" }, { status: 400 });
  }

  const submission = await prisma.applicationSubmission.findUnique({ where: { id: submissionId } });
  if (!submission) return NextResponse.json({ error: "Soumission introuvable" }, { status: 404 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: submission.botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Non autorisé" }, { status: 404 });

  await prisma.applicationSubmission.update({
    where: { id: submissionId },
    data: {
      status: action === "accept" ? "accepted" : "rejected",
      reviewerId: session.user.id,
      reviewedAt: new Date(),
    },
  });

  // Demande au bot d'appliquer (DM, rôle si accept)
  await prisma.discordBot.update({
    where: { id: submission.botId },
    data: { workerCommand: `APP_REVIEW_${submissionId}_${action}` },
  });

  return NextResponse.json({ success: true });
}
