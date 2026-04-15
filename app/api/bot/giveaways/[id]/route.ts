import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/bot/giveaways/[id]
// - body.action = "end" | "cancel" | "reroll"  → actions rapides
// - sinon → mise à jour complète des champs
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const giveaway = await prisma.giveaway.findFirst({
    where: { id },
    include: { bot: { select: { userId: true } } },
  });

  if (!giveaway || giveaway.bot.userId !== session.user.id)
    return NextResponse.json({ error: "Giveaway introuvable" }, { status: 404 });

  const { action } = body;

  if (action === "cancel") {
    const updated = await prisma.giveaway.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json(updated);
  }

  if (action === "end") {
    const updated = await prisma.giveaway.update({ where: { id }, data: { status: "ENDED", endAt: new Date() } });
    return NextResponse.json(updated);
  }

  if (action === "reroll") {
    const updated = await prisma.giveaway.update({ where: { id }, data: { status: "ACTIVE", winnerIds: [] } });
    return NextResponse.json(updated);
  }

  // Mise à jour complète (édition)
  const {
    title, prize, description, mode, winnerCount, endAt, startAt,
    requiredRoleIds, minLevel, mustBeBooster, minDaysOnServer,
    useEmbed, embedColor, embedImage,
  } = body;

  const data: Record<string, unknown> = {};
  if (title !== undefined)           data.title = title;
  if (prize !== undefined)           data.prize = prize;
  if (description !== undefined)     data.description = description || null;
  if (mode !== undefined)            data.mode = mode;
  if (winnerCount !== undefined)     data.winnerCount = Number(winnerCount);
  if (endAt !== undefined)           data.endAt = new Date(endAt);
  if (startAt !== undefined)         data.startAt = startAt ? new Date(startAt) : null;
  if (requiredRoleIds !== undefined) data.requiredRoleIds = requiredRoleIds ?? null;
  if (minLevel !== undefined)        data.minLevel = minLevel ?? null;
  if (mustBeBooster !== undefined)   data.mustBeBooster = mustBeBooster;
  if (minDaysOnServer !== undefined) data.minDaysOnServer = minDaysOnServer ?? null;
  if (useEmbed !== undefined)        data.useEmbed = useEmbed;
  if (embedColor !== undefined)      data.embedColor = embedColor || null;
  if (embedImage !== undefined)      data.embedImage = embedImage || null;

  // Recalculer le statut si la date de fin a changé
  if (endAt !== undefined) {
    const newEnd = new Date(endAt);
    if (giveaway.status === "ENDED" || giveaway.status === "CANCELLED") {
      data.status = newEnd > new Date() ? "ACTIVE" : "ENDED";
    }
  }

  const updated = await prisma.giveaway.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/bot/giveaways/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;

  const giveaway = await prisma.giveaway.findFirst({
    where: { id },
    include: { bot: { select: { userId: true } } },
  });

  if (!giveaway || giveaway.bot.userId !== session.user.id)
    return NextResponse.json({ error: "Giveaway introuvable" }, { status: 404 });

  await prisma.giveaway.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
