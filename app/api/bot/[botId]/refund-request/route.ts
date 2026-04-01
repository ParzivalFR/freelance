import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { botId } = await params;

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) {
    return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  }

  const request = await prisma.refundRequest.findFirst({
    where: { botId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(request);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { botId } = await params;

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) {
    return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  }

  if (!bot.plan || !bot.paidAt) {
    return NextResponse.json({ error: "Aucun achat associé à ce bot" }, { status: 400 });
  }

  // Check for existing pending/approved request
  const existing = await prisma.refundRequest.findFirst({
    where: { botId, status: { in: ["PENDING", "APPROVED"] } },
  });
  if (existing) {
    return NextResponse.json({ error: "Une demande de remboursement est déjà en cours" }, { status: 400 });
  }

  const body = await request.json();
  const reason = (body.reason as string)?.trim();
  if (!reason || reason.length < 10) {
    return NextResponse.json({ error: "Veuillez fournir une raison (min. 10 caractères)" }, { status: 400 });
  }

  const refundRequest = await prisma.refundRequest.create({
    data: {
      botId,
      userId: session.user.id,
      reason,
    },
  });

  return NextResponse.json(refundRequest, { status: 201 });
}
