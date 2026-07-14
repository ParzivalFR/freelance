import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfNeeded } from "@/lib/monitor-crypto";
import { NextResponse } from "next/server";

interface RRPanel {
  id: string;
  channelId?: string;
  messageId?: string;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { botId, panelId } = (await request.json().catch(() => ({}))) as { botId?: string; panelId?: string };
  if (!botId || !panelId) return NextResponse.json({ error: "botId ou panelId manquant" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({ where: { id: botId, userId: session.user.id } });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const cfg = (bot.config ?? {}) as Record<string, unknown>;
  const panels = (cfg.reactionRoles as RRPanel[] | undefined) ?? [];
  const panel = panels.find((p) => p.id === panelId);

  // Supprime le message Discord si le panel avait été posté et que le token est disponible.
  if (panel?.channelId && panel.messageId && bot.token) {
    const token = decryptIfNeeded(bot.token);
    await fetch(`https://discord.com/api/v10/channels/${panel.channelId}/messages/${panel.messageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bot ${token}` },
    }).catch(() => {});
  }

  const updatedPanels = panels.filter((p) => p.id !== panelId);
  await prisma.discordBot.update({
    where: { id: botId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { config: { ...cfg, reactionRoles: updatedPanels } as any },
  });

  return NextResponse.json({ success: true });
}
