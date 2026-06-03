import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: { botId: string; userIds: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const { botId, userIds } = body;

  if (!botId || !Array.isArray(userIds)) {
    return NextResponse.json({ error: "botId et userIds requis" }, { status: 400 });
  }

  const limited = userIds.slice(0, 25);

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
    select: { token: true, guildId: true },
  });

  if (!bot) {
    return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
  }

  const result: Record<string, { username: string; displayName: string; avatar: string | null }> = {};

  await Promise.all(
    limited.map(async (userId) => {
      try {
        const res = await fetch(
          `https://discord.com/api/v10/guilds/${bot.guildId}/members/${userId}`,
          {
            headers: { Authorization: `Bot ${bot.token}` },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const member = await res.json();
        const user = member.user;
        result[userId] = {
          username: user.username,
          displayName: member.nick ?? user.global_name ?? user.username,
          avatar: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64`
            : null,
        };
      } catch {
        result[userId] = {
          username: "Utilisateur inconnu",
          displayName: userId,
          avatar: null,
        };
      }
    })
  );

  return NextResponse.json(result);
}
