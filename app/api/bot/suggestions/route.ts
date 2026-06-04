import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");
  if (!botId) return NextResponse.json({ error: "botId manquant" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const suggestions = await prisma.suggestion.findMany({
    where: { botId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ suggestions });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { id, status, response } = body;
  if (!id || !status) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

  const sug = await prisma.suggestion.findUnique({ where: { id } });
  if (!sug) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: sug.botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Non autorisé" }, { status: 404 });

  const updated = await prisma.suggestion.update({
    where: { id },
    data: {
      status,
      response: response ?? null,
      respondedBy: session.user.id,
    },
  });

  // Demander au bot de mettre à jour le message Discord
  if (sug.messageId) {
    await prisma.discordBot.update({
      where: { id: sug.botId },
      data: { workerCommand: `SUGGESTION_SYNC_${id}` },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const sug = await prisma.suggestion.findUnique({ where: { id } });
  if (!sug) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: sug.botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Non autorisé" }, { status: 404 });

  // Demande au bot de supprimer le message Discord AVANT de supprimer en DB
  if (sug.messageId) {
    await prisma.discordBot.update({
      where: { id: sug.botId },
      data: { workerCommand: `SUGGESTION_DELETE_${sug.guildId}_${sug.messageId}` },
    });
    // Petit délai pour laisser le bot traiter
    await new Promise((r) => setTimeout(r, 500));
  }

  await prisma.suggestion.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
