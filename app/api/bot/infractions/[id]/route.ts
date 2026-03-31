import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const infraction = await prisma.infraction.findUnique({
    where: { id },
    include: { bot: { select: { userId: true } } },
  });

  if (!infraction || infraction.bot.userId !== session.user.id) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  await prisma.infraction.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
