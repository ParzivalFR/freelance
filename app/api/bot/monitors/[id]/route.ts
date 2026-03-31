import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
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

  if (!monitor || monitor.bot.userId !== session.user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  await prisma.monitor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const monitor = await prisma.monitor.findUnique({
    where: { id },
    include: { bot: { select: { userId: true } } },
  });

  if (!monitor || monitor.bot.userId !== session.user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const updated = await prisma.monitor.update({ where: { id }, data: body });
  return NextResponse.json({ monitor: updated });
}
