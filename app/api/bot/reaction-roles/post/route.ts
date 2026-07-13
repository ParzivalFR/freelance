import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfNeeded } from "@/lib/monitor-crypto";
import { NextResponse } from "next/server";

interface RRButton {
  roleId: string;
  label: string;
  emoji?: string;
  style?: "primary" | "secondary" | "success" | "danger";
}
interface RRPanel {
  id: string;
  channelId?: string;
  messageId?: string;
  title: string;
  description?: string;
  color?: string;
  buttons: RRButton[];
}

const STYLE_MAP: Record<string, number> = { primary: 1, secondary: 2, success: 3, danger: 4 };

// Discord attend { name } pour un emoji unicode, { id, name, animated } pour un emoji custom.
function parseEmoji(emoji: string): Record<string, unknown> | undefined {
  const trimmed = emoji.trim();
  if (!trimmed) return undefined;
  const custom = trimmed.match(/^<(a)?:(\w+):(\d+)>$/);
  if (custom) return { id: custom[3], name: custom[2], animated: !!custom[1] };
  return { name: trimmed };
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { botId, panelId } = (await request.json().catch(() => ({}))) as { botId?: string; panelId?: string };
  if (!botId || !panelId) return NextResponse.json({ error: "botId ou panelId manquant" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({ where: { id: botId, userId: session.user.id } });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  if (!bot.token) return NextResponse.json({ error: "Token bot manquant" }, { status: 400 });

  const cfg = (bot.config ?? {}) as Record<string, unknown>;
  const panels = (cfg.reactionRoles as RRPanel[] | undefined) ?? [];
  const panel = panels.find((p) => p.id === panelId);
  if (!panel) return NextResponse.json({ error: "Panel introuvable" }, { status: 404 });
  if (!panel.channelId) return NextResponse.json({ error: "Aucun salon sélectionné pour ce panel." }, { status: 400 });
  if (panel.buttons.length === 0) return NextResponse.json({ error: "Ajoute au moins un bouton avant de poster." }, { status: 400 });

  const colorHex = (panel.color ?? "393a41").replace("#", "");
  const color = parseInt(colorHex, 16);

  // Boutons chunkés par 5 (max par ligne)
  const rows: unknown[] = [];
  for (let i = 0; i < panel.buttons.length; i += 5) {
    const chunk = panel.buttons.slice(i, i + 5);
    rows.push({
      type: 1,
      components: chunk.map((btn) => ({
        type: 2,
        style: STYLE_MAP[btn.style ?? "secondary"] ?? 2,
        label: btn.label,
        custom_id: `rr_${panelId}_${btn.roleId}`,
        ...(btn.emoji ? { emoji: parseEmoji(btn.emoji) } : {}),
      })),
    });
  }

  // Container Components V2 (type 17) : titre + description + boutons dans un seul bloc.
  const container = {
    type: 17,
    accent_color: Number.isNaN(color) ? parseInt("393a41", 16) : color,
    components: [
      { type: 10, content: `## ${panel.title}` },
      ...(panel.description ? [{ type: 14, spacing: 1 }, { type: 10, content: panel.description }] : []),
      { type: 14, spacing: 1 },
      ...rows,
    ],
  };

  const token = decryptIfNeeded(bot.token);
  const res = await fetch(`https://discord.com/api/v10/channels/${panel.channelId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    // 32768 = MessageFlags.IsComponentsV2
    body: JSON.stringify({ flags: 32768, components: [container] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: `Erreur Discord : ${(err as { message?: string }).message ?? res.status}` },
      { status: res.status }
    );
  }

  const message = (await res.json()) as { id: string };

  // Sauvegarde le messageId dans le panel pour permettre le refresh ultérieur
  const updatedPanels = panels.map((p) =>
    p.id === panelId ? { ...p, messageId: message.id } : p
  );
  await prisma.discordBot.update({
    where: { id: botId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { config: { ...cfg, reactionRoles: updatedPanels } as any },
  });

  return NextResponse.json({ success: true });
}
