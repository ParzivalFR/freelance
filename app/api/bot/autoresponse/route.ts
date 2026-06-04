import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  if (!bot) return NextResponse.json({ autoResponses: [] });

  const autoResponses = await prisma.$queryRaw`
    SELECT * FROM auto_responses
    WHERE bot_id = ${bot.id}
    ORDER BY created_at ASC
  `;

  return NextResponse.json({ autoResponses });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { botId, guildId, trigger, triggerType, response, responseType, embedColor, embedTitle,
    caseSensitive, cooldownSeconds, allowedChannelIds, ignoredRoleIds, deleteOriginal, replyToUser } = body;

  if (!botId || !guildId || !trigger || !response)
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const id = crypto.randomUUID();

  await prisma.$executeRaw`
    INSERT INTO auto_responses (
      id, bot_id, guild_id, trigger, trigger_type, response, response_type,
      embed_color, embed_title, case_sensitive, cooldown_seconds,
      allowed_channel_ids, ignored_role_ids, delete_original, reply_to_user,
      trigger_count, enabled, created_at, updated_at
    ) VALUES (
      ${id}, ${bot.id}, ${guildId}, ${trigger}, ${triggerType ?? "contains"},
      ${response}, ${responseType ?? "text"},
      ${embedColor ?? null}, ${embedTitle ?? null},
      ${caseSensitive ?? false}, ${cooldownSeconds ?? 0},
      ${JSON.stringify(allowedChannelIds ?? [])}::jsonb,
      ${JSON.stringify(ignoredRoleIds ?? [])}::jsonb,
      ${deleteOriginal ?? false}, ${replyToUser ?? true},
      0, TRUE, NOW(), NOW()
    )
  `;

  const [created] = await prisma.$queryRaw<unknown[]>`
    SELECT * FROM auto_responses WHERE id = ${id}
  `;

  return NextResponse.json({ autoResponse: created }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json();
  const { id, botId, ...fields } = body;

  if (!id || !botId)
    return NextResponse.json({ error: "id et botId requis" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  // Vérifier que l'autoresponse appartient bien à ce bot
  const existing = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM auto_responses WHERE id = ${id} AND bot_id = ${bot.id}
  `;
  if (!existing.length) return NextResponse.json({ error: "Auto-réponse introuvable" }, { status: 404 });

  // Construire la mise à jour dynamiquement selon les champs présents
  if ("enabled" in fields) {
    await prisma.$executeRaw`
      UPDATE auto_responses SET enabled = ${fields.enabled}, updated_at = NOW() WHERE id = ${id}
    `;
  }
  if ("trigger" in fields) {
    await prisma.$executeRaw`
      UPDATE auto_responses
      SET trigger = ${fields.trigger},
          trigger_type = ${fields.triggerType ?? "contains"},
          response = ${fields.response},
          response_type = ${fields.responseType ?? "text"},
          embed_color = ${fields.embedColor ?? null},
          embed_title = ${fields.embedTitle ?? null},
          case_sensitive = ${fields.caseSensitive ?? false},
          cooldown_seconds = ${fields.cooldownSeconds ?? 0},
          allowed_channel_ids = ${JSON.stringify(fields.allowedChannelIds ?? [])}::jsonb,
          ignored_role_ids = ${JSON.stringify(fields.ignoredRoleIds ?? [])}::jsonb,
          delete_original = ${fields.deleteOriginal ?? false},
          reply_to_user = ${fields.replyToUser ?? true},
          updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  const [updated] = await prisma.$queryRaw<unknown[]>`
    SELECT * FROM auto_responses WHERE id = ${id}
  `;

  return NextResponse.json({ autoResponse: updated });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const botId = searchParams.get("botId");

  if (!id || !botId)
    return NextResponse.json({ error: "id et botId requis" }, { status: 400 });

  const bot = await prisma.discordBot.findFirst({
    where: { id: botId, userId: session.user.id },
  });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  await prisma.$executeRaw`
    DELETE FROM auto_responses WHERE id = ${id} AND bot_id = ${bot.id}
  `;

  return NextResponse.json({ success: true });
}
