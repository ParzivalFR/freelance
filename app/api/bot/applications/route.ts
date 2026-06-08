import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");
  if (!botId) return NextResponse.json({ error: "botId manquant" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  if (bot.plan !== "PRO" && bot.plan !== "MANAGED") {
    return NextResponse.json({ error: "Abonnement PRO requis." }, { status: 403 });
  }

  const [forms, submissions] = await Promise.all([
    prisma.applicationForm.findMany({
      where: { botId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.applicationSubmission.findMany({
      where: { botId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({ forms, submissions });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { botId, title, description, questions, reviewChannelId, acceptRoleId, acceptDmMessage, rejectDmMessage, color, maxSubmissions, enabled } = body;

  if (!botId || !title) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const guildId = (bot.config as { guildId?: string } | null)?.guildId;
  if (!guildId) return NextResponse.json({ error: "GuildId manquant" }, { status: 400 });

  const created = await prisma.applicationForm.create({
    data: {
      botId,
      guildId,
      title,
      description: description ?? null,
      questions: questions ?? [],
      reviewChannelId: reviewChannelId ?? null,
      acceptRoleId: acceptRoleId ?? null,
      acceptDmMessage: acceptDmMessage ?? null,
      rejectDmMessage: rejectDmMessage ?? null,
      color: color ?? "#5865f2",
      maxSubmissions: maxSubmissions ?? 0,
      enabled: enabled !== false,
    },
  });

  return NextResponse.json(created);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const form = await prisma.applicationForm.findUnique({ where: { id } });
  if (!form) return NextResponse.json({ error: "Form introuvable" }, { status: 404 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: form.botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const updated = await prisma.applicationForm.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const form = await prisma.applicationForm.findUnique({ where: { id } });
  if (!form) return NextResponse.json({ error: "Form introuvable" }, { status: 404 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: form.botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  await prisma.applicationSubmission.deleteMany({ where: { formId: id } });
  await prisma.applicationForm.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
