import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DEFAULT_COLOR = "393a41";

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
    select: { token: true, config: true, name: true },
  });

  if (!bot?.token) {
    return NextResponse.json({ error: "Bot introuvable ou token manquant" }, { status: 404 });
  }

  const cfg = (bot.config ?? {}) as Record<string, unknown>;
  const channelId = (cfg.honeypotChannelId as string | undefined)?.trim();

  if (!channelId) {
    return NextResponse.json({ error: "Aucun salon-piège configuré. Sélectionne un salon puis enregistre." }, { status: 400 });
  }

  const colorHex = ((cfg.honeypotEmbedColor as string | undefined) ?? DEFAULT_COLOR).replace("#", "");
  const colorInt = parseInt(colorHex, 16);
  const counter = (cfg.honeypotCounter as number | undefined) ?? 0;

  const embed = {
    color: Number.isNaN(colorInt) ? parseInt(DEFAULT_COLOR, 16) : colorInt,
    author: { name: "Système de protection anti-spam" },
    title: (cfg.honeypotEmbedTitle as string | undefined)?.trim() || "🍯 Salon piège — ne postez rien ici",
    description:
      (cfg.honeypotEmbedDescription as string | undefined)?.trim() ||
      "> **N'envoyez aucun message dans ce salon.**\n> Tout message posté ici entraîne un **bannissement automatique** (softban).\n> Ce salon sert à piéger les comptes compromis et les bots de spam.",
    fields: [
      { name: "⚙️ Action", value: "Softban automatique", inline: true },
      { name: "🛡️ Comptes piégés", value: String(counter), inline: true },
    ],
    footer: { text: (cfg.honeypotEmbedFooter as string | undefined)?.trim() || `${bot.name} • Honeypot` },
    timestamp: new Date().toISOString(),
  };

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${bot.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const msg = (error as { message?: string }).message ?? "Erreur Discord";
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const message = (await res.json()) as { id: string };

  // Persiste l'emplacement de l'embed pour que le bot puisse mettre à jour le compteur
  await prisma.discordBot.update({
    where: { id: botId },
    data: {
      config: {
        ...cfg,
        honeypotEmbedChannelId: channelId,
        honeypotEmbedMessageId: message.id,
      },
    },
  });

  return NextResponse.json({ success: true });
}
