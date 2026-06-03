import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;

  const monitor = await prisma.monitor.findUnique({
    where: { id },
    include: { bot: { select: { userId: true } } },
  });

  if (!monitor || monitor.bot.userId !== session.user.id)
    return NextResponse.json({ error: "Monitor introuvable" }, { status: 404 });

  // The actual check must run on the bot-engine (TCP/ping/DB are not available from Vercel).
  // We schedule it by writing a pending command into the bot config via DB.
  // The bot-engine sync loop (every 10s) will pick it up and run an immediate check.
  await prisma.$executeRaw`
    UPDATE "DiscordBot"
    SET config = jsonb_set(
      COALESCE(config, '{}'),
      '{pendingChecks}',
      COALESCE(config->'pendingChecks', '[]'::jsonb) || ${JSON.stringify([id])}::jsonb
    )
    WHERE id = ${monitor.botId}
  `;

  return NextResponse.json(
    { message: "Check planifié — résultat visible dans ~15s" },
    { status: 202 }
  );
}
