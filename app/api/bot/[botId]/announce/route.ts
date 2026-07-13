import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfNeeded } from "@/lib/monitor-crypto";
import { NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";

interface EmbedInput {
  title?: string;
  description?: string;
  color?: string;
  footer?: string;
  imageUrl?: string;
}

// Vérifie l'ownership et renvoie le token du bot
async function getBotToken(botId: string, userId: string): Promise<string | null> {
  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId },
    select: { token: true },
  });
  return bot?.token ? decryptIfNeeded(bot.token) : null;
}

// Construit le payload Discord à partir du mode + contenu
function buildPayload(
  mode: "text" | "embed",
  content: string | undefined,
  embed: EmbedInput | undefined
): { payload: Record<string, unknown> } | { error: string } {
  if (mode === "text") {
    if (!content?.trim()) return { error: "Contenu du message manquant" };
    return { payload: { content } };
  }

  if (!embed?.description?.trim() && !embed?.title?.trim()) {
    return { error: "L'embed doit avoir au moins un titre ou une description" };
  }

  const colorHex = (embed.color ?? "393a41").replace("#", "");
  const colorInt = parseInt(colorHex, 16);

  const embedPayload: Record<string, unknown> = {
    color: Number.isNaN(colorInt) ? parseInt("393a41", 16) : colorInt,
  };
  if (embed.title?.trim()) embedPayload.title = embed.title.trim();
  if (embed.description?.trim()) embedPayload.description = embed.description.trim();
  if (embed.footer?.trim()) embedPayload.footer = { text: embed.footer.trim() };
  if (embed.imageUrl?.trim()) embedPayload.image = { url: embed.imageUrl.trim() };

  // Sur une édition, il faut vider le content s'il ne reste qu'un embed
  return { payload: { content: "", embeds: [embedPayload] } };
}

// ─── POST : envoyer une nouvelle annonce ────────────────────────────────────────
export async function POST(request: Request, { params }: { params: Promise<{ botId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { botId } = await params;
  const token = await getBotToken(botId, session.user.id);
  if (!token) return NextResponse.json({ error: "Bot introuvable ou token manquant" }, { status: 404 });

  const body = await request.json();
  const { channelId, mode, content, embed } = body as {
    channelId: string;
    mode: "text" | "embed";
    content?: string;
    embed?: EmbedInput;
  };

  if (!channelId) return NextResponse.json({ error: "channelId manquant" }, { status: 400 });

  const built = buildPayload(mode, content, embed);
  if ("error" in built) return NextResponse.json({ error: built.error }, { status: 400 });

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(built.payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    return NextResponse.json({ error: (error as { message?: string }).message ?? "Erreur Discord" }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}

// ─── PATCH : modifier une annonce existante ─────────────────────────────────────
export async function PATCH(request: Request, { params }: { params: Promise<{ botId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { botId } = await params;
  const token = await getBotToken(botId, session.user.id);
  if (!token) return NextResponse.json({ error: "Bot introuvable ou token manquant" }, { status: 404 });

  const body = await request.json();
  const { channelId, messageId, mode, content, embed } = body as {
    channelId: string;
    messageId: string;
    mode: "text" | "embed";
    content?: string;
    embed?: EmbedInput;
  };

  if (!channelId || !messageId) {
    return NextResponse.json({ error: "channelId ou messageId manquant" }, { status: 400 });
  }

  const built = buildPayload(mode, content, embed);
  if ("error" in built) return NextResponse.json({ error: built.error }, { status: 400 });

  // En mode texte on retire l'embed existant
  if (mode === "text") built.payload.embeds = [];

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages/${messageId}`, {
    method: "PATCH",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(built.payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const status = res.status;
    const msg =
      status === 403 || status === 404
        ? "Message introuvable ou non modifiable (le bot ne peut éditer que ses propres messages)."
        : (error as { message?: string }).message ?? "Erreur Discord";
    return NextResponse.json({ error: msg }, { status });
  }

  return NextResponse.json({ success: true });
}

// ─── GET : charger une annonce existante pour pré-remplir le formulaire ──────────
export async function GET(request: Request, { params }: { params: Promise<{ botId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { botId } = await params;
  const token = await getBotToken(botId, session.user.id);
  if (!token) return NextResponse.json({ error: "Bot introuvable ou token manquant" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId");
  const messageId = searchParams.get("messageId");
  if (!channelId || !messageId) {
    return NextResponse.json({ error: "channelId ou messageId manquant" }, { status: 400 });
  }

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages/${messageId}`, {
    headers: { Authorization: `Bot ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Message introuvable. Vérifie le lien." }, { status: res.status });
  }

  const message = (await res.json()) as {
    content?: string;
    embeds?: { title?: string; description?: string; color?: number; footer?: { text?: string }; image?: { url?: string } }[];
  };

  const firstEmbed = message.embeds?.[0];
  if (firstEmbed) {
    return NextResponse.json({
      mode: "embed",
      embed: {
        title: firstEmbed.title ?? "",
        description: firstEmbed.description ?? "",
        color: firstEmbed.color != null ? firstEmbed.color.toString(16).padStart(6, "0") : "393a41",
        footer: firstEmbed.footer?.text ?? "",
        imageUrl: firstEmbed.image?.url ?? "",
      },
    });
  }

  return NextResponse.json({ mode: "text", content: message.content ?? "" });
}
