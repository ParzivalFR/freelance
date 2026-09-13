import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfNeeded } from "@/lib/monitor-crypto";
import { NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";

/**
 * Commandes « globales » de l'application Discord.
 *
 * Le moteur de bot n'enregistre que des commandes de serveur
 * (`/applications/{id}/guilds/{guildId}/commands`). Une application réutilisée
 * d'un bot précédent garde ses commandes globales, que plus rien n'exécute :
 * le client les voit dans Discord, les utilise, et obtient « l'application n'a
 * pas répondu ».
 *
 * Ces deux points de terminaison sont distincts : vider la liste globale ne
 * touche pas aux commandes de serveur.
 */

async function getBotToken(botId: string, userId: string): Promise<string | null> {
  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId },
    select: { token: true },
  });
  return bot?.token ? decryptIfNeeded(bot.token) : null;
}

async function getApplicationId(token: string): Promise<string | null> {
  const response = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = (await response.json()) as { id?: string };
  return user.id ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ botId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { botId } = await params;
  const token = await getBotToken(botId, session.user.id);
  if (!token)
    return NextResponse.json(
      { error: "Bot introuvable ou token manquant" },
      { status: 404 },
    );

  const applicationId = await getApplicationId(token);
  if (!applicationId)
    return NextResponse.json(
      { error: "Token refusé par Discord" },
      { status: 502 },
    );

  const response = await fetch(`${DISCORD_API}/applications/${applicationId}/commands`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });
  if (!response.ok)
    return NextResponse.json(
      { error: "Discord n'a pas répondu" },
      { status: 502 },
    );

  const commands = (await response.json()) as Array<{ id: string; name: string }>;
  return NextResponse.json({
    commands: commands.map((command) => command.name),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ botId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { botId } = await params;
  const token = await getBotToken(botId, session.user.id);
  if (!token)
    return NextResponse.json(
      { error: "Bot introuvable ou token manquant" },
      { status: 404 },
    );

  const applicationId = await getApplicationId(token);
  if (!applicationId)
    return NextResponse.json(
      { error: "Token refusé par Discord" },
      { status: 502 },
    );

  // Liste vide = suppression de toutes les commandes globales. Les commandes
  // de serveur, enregistrées sur une autre route, ne sont pas concernées.
  const response = await fetch(`${DISCORD_API}/applications/${applicationId}/commands`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([]),
  });

  if (!response.ok) {
    console.error(
      "🛑 Suppression des commandes globales refusée :",
      response.status,
      await response.text().catch(() => ""),
    );
    return NextResponse.json(
      { error: "Discord a refusé la suppression" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
