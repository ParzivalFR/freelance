import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    select: { token: true },
  });

  if (!bot?.token) {
    return NextResponse.json({ error: "Bot introuvable ou token manquant" }, { status: 404 });
  }

  const body = await request.json();
  const { channelId, mode, content, embed } = body as {
    channelId: string;
    mode: "text" | "embed";
    content?: string;
    embed?: {
      title?: string;
      description?: string;
      color?: string;
      footer?: string;
      imageUrl?: string;
    };
  };

  if (!channelId) {
    return NextResponse.json({ error: "channelId manquant" }, { status: 400 });
  }

  let payload: Record<string, unknown>;

  if (mode === "text") {
    if (!content?.trim()) {
      return NextResponse.json({ error: "Contenu du message manquant" }, { status: 400 });
    }
    payload = { content };
  } else {
    if (!embed?.description?.trim() && !embed?.title?.trim()) {
      return NextResponse.json({ error: "L'embed doit avoir au moins un titre ou une description" }, { status: 400 });
    }

    const colorHex = (embed.color ?? "393a41").replace("#", "");
    const colorInt = parseInt(colorHex, 16);

    const embedPayload: Record<string, unknown> = {
      color: colorInt,
    };
    if (embed.title?.trim()) embedPayload.title = embed.title.trim();
    if (embed.description?.trim()) embedPayload.description = embed.description.trim();
    if (embed.footer?.trim()) embedPayload.footer = { text: embed.footer.trim() };
    if (embed.imageUrl?.trim()) embedPayload.image = { url: embed.imageUrl.trim() };

    payload = { embeds: [embedPayload] };
  }

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${bot.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const msg = (error as { message?: string }).message ?? "Erreur Discord";
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
