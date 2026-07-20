import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function parseSchedule(input: string): { nextRun: Date; recurring: boolean } | null {
  const lower = input.trim().toLowerCase();
  const now = new Date();

  if (lower === "daily") return { nextRun: new Date(now.getTime() + 86_400_000), recurring: true };
  if (lower === "weekly") return { nextRun: new Date(now.getTime() + 7 * 86_400_000), recurring: true };
  if (lower === "monthly") {
    const next = new Date(now);
    next.setMonth(next.getMonth() + 1);
    return { nextRun: next, recurring: true };
  }

  const date = new Date(input.includes("T") ? input : input.replace(" ", "T"));
  if (isNaN(date.getTime()) || date.getTime() <= now.getTime()) return null;
  return { nextRun: date, recurring: false };
}

async function getOwnedBot(botId: string | null, userId: string) {
  if (!botId) return null;
  return prisma.discordBot.findFirst({
    where: { id: botId, userId },
    select: { id: true, config: true },
  });
}

// GET — liste des messages programmés du bot
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");

  const bot = await getOwnedBot(botId, session.user.id);
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const messages = await prisma.scheduledMessage.findMany({
    where: { botId: bot.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(messages);
}

// POST — créer un message programmé
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { botId, channelId, content, when } = body;

  const bot = await getOwnedBot(botId, session.user.id);
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const guildId = (bot.config as { guildId?: string } | null)?.guildId;
  if (!guildId) return NextResponse.json({ error: "guildId non configuré sur ce bot" }, { status: 400 });

  if (!channelId || !content?.trim() || !when?.trim()) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  if (content.length > 1500) {
    return NextResponse.json({ error: "Contenu trop long (1500 caractères max)" }, { status: 400 });
  }

  const parsed = parseSchedule(when);
  if (!parsed) {
    return NextResponse.json(
      { error: "Format invalide pour 'quand' : daily, weekly, monthly ou YYYY-MM-DD HH:mm" },
      { status: 400 }
    );
  }

  const created = await prisma.scheduledMessage.create({
    data: {
      botId: bot.id,
      guildId,
      channelId,
      content,
      cronExpression: parsed.recurring ? when.toLowerCase() : null,
      nextRun: parsed.nextRun,
      isRecurring: parsed.recurring,
    },
  });

  return NextResponse.json(created);
}

// PATCH — modifier un message programmé (contenu, salon, planification, activation)
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { id, botId, channelId, content, when, enabled } = body;

  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const bot = await getOwnedBot(botId, session.user.id);
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const existing = await prisma.scheduledMessage.findFirst({ where: { id, botId: bot.id } });
  if (!existing) return NextResponse.json({ error: "Message programmé introuvable" }, { status: 404 });

  if (content !== undefined && content.length > 1500) {
    return NextResponse.json({ error: "Contenu trop long (1500 caractères max)" }, { status: 400 });
  }

  let scheduleFields: { cronExpression?: string | null; nextRun?: Date; isRecurring?: boolean } = {};
  if (when !== undefined) {
    const parsed = parseSchedule(when);
    if (!parsed) {
      return NextResponse.json(
        { error: "Format invalide pour 'quand' : daily, weekly, monthly ou YYYY-MM-DD HH:mm" },
        { status: 400 }
      );
    }
    scheduleFields = {
      cronExpression: parsed.recurring ? when.toLowerCase() : null,
      nextRun: parsed.nextRun,
      isRecurring: parsed.recurring,
    };
  }

  const updated = await prisma.scheduledMessage.update({
    where: { id },
    data: {
      ...(channelId !== undefined && { channelId }),
      ...(content !== undefined && { content }),
      ...(enabled !== undefined && { enabled }),
      ...scheduleFields,
    },
  });

  return NextResponse.json(updated);
}

// DELETE — supprimer un message programmé
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const botId = searchParams.get("botId");

  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const bot = await getOwnedBot(botId, session.user.id);
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const existing = await prisma.scheduledMessage.findFirst({ where: { id, botId: bot.id } });
  if (!existing) return NextResponse.json({ error: "Message programmé introuvable" }, { status: 404 });

  await prisma.scheduledMessage.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
