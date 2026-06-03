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

  if (!botId) {
    return NextResponse.json({ error: "botId manquant" }, { status: 400 });
  }

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
    select: { token: true, config: true },
  });

  if (!bot) {
    return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  }

  if (!bot.token) {
    return NextResponse.json({ error: "Token bot manquant" }, { status: 400 });
  }

  const config = (bot.config ?? {}) as { guildId?: string };
  const guildId = config.guildId;

  if (!guildId) {
    return NextResponse.json({ error: "guildId non configuré" }, { status: 400 });
  }

  const headers = { Authorization: `Bot ${bot.token}` };

  const [channelsRes, rolesRes] = await Promise.all([
    fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, { headers }),
    fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, { headers }),
  ]);

  if (!channelsRes.ok || !rolesRes.ok) {
    return NextResponse.json({ error: "Impossible de contacter l'API Discord" }, { status: 502 });
  }

  const rawChannels = await channelsRes.json() as { id: string; name: string; type: number }[];
  const rawRoles = await rolesRes.json() as { id: string; name: string; color: number }[];

  const channels = rawChannels
    .filter((c) => c.type === 0 || c.type === 2)
    .map((c) => ({ id: c.id, name: c.name, type: c.type }));

  const roles = rawRoles
    .filter((r) => r.name !== "@everyone")
    .map((r) => ({ id: r.id, name: r.name, color: r.color }));

  return NextResponse.json({ channels, roles });
}
