import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");
  if (!botId) return NextResponse.json({ error: "botId manquant" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ panels: [] });

  const panels = await (prisma as unknown as {
    reactionRolePanel: {
      findMany: (args: object) => Promise<unknown[]>;
    };
  }).reactionRolePanel.findMany({
    where: { botId: bot.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ panels });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { botId, guildId, title, description, color, mode, buttons } = body;

  if (!botId || !title)
    return NextResponse.json({ error: "botId et title requis" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const panel = await (prisma as unknown as {
    reactionRolePanel: {
      create: (args: object) => Promise<unknown>;
    };
  }).reactionRolePanel.create({
    data: {
      id: randomUUID(),
      botId: bot.id,
      guildId: guildId ?? "",
      title,
      description: description ?? null,
      color: color ?? null,
      mode: mode ?? "toggle",
      buttons: buttons ?? [],
    },
  });

  return NextResponse.json({ panel }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const panelId = searchParams.get("panelId");
  const botId = searchParams.get("botId");

  if (!panelId || !botId)
    return NextResponse.json({ error: "panelId et botId requis" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  await (prisma as unknown as {
    reactionRolePanel: {
      deleteMany: (args: object) => Promise<unknown>;
    };
  }).reactionRolePanel.deleteMany({
    where: { id: panelId, botId: bot.id },
  });

  return NextResponse.json({ ok: true });
}
