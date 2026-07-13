import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfNeeded } from "@/lib/monitor-crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { botId } = body as { botId?: string };
  if (!botId)
    return NextResponse.json({ error: "botId manquant" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot)
    return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  if (!bot.token)
    return NextResponse.json({ error: "Token bot manquant" }, { status: 400 });

  const cfg = (bot.config ?? {}) as Record<string, unknown>;
  const channelId = cfg.verificationChannelId as string | undefined;
  if (!channelId)
    return NextResponse.json({ error: "Aucun salon configuré pour le panel." }, { status: 400 });

  const colorHex = ((cfg.verificationEmbedColor as string) ?? "393a41").replace("#", "");
  const color = parseInt(colorHex, 16) || parseInt("393a41", 16);
  const title = (cfg.verificationEmbedTitle as string) || "Vérification";
  const description =
    (cfg.verificationEmbedDescription as string) ||
    "Clique sur le bouton ci-dessous pour accepter les règles et accéder au serveur.";
  const buttonLabel = (cfg.verificationButtonLabel as string) || "✅ J'accepte les règles";
  const image = cfg.verificationEmbedImage as string | undefined;

  // Container Components V2 (type 17) : texte + image + bouton, dans un seul bloc.
  const container = {
    type: 17,
    accent_color: color,
    components: [
      { type: 10, content: `## ${title}` },
      { type: 14, spacing: 1 },
      { type: 10, content: description },
      ...(image ? [{ type: 12, items: [{ media: { url: image } }] }] : []),
      { type: 14, spacing: 1 },
      {
        type: 1,
        components: [
          { type: 2, style: 3, label: buttonLabel, custom_id: "verification:accept" },
        ],
      },
    ],
  };

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${decryptIfNeeded(bot.token)}`,
      "Content-Type": "application/json",
    },
    // 32768 = MessageFlags.IsComponentsV2
    body: JSON.stringify({ flags: 32768, components: [container] }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: `Erreur Discord : ${(err as { message?: string }).message ?? res.status}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
