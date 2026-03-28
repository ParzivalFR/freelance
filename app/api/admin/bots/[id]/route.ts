import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN" ? session : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await params;
  const { workerCommand } = await request.json();

  const bot = await prisma.discordBot.findUnique({ where: { id } });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  const updated = await prisma.discordBot.update({
    where: { id },
    data: { workerCommand },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await params;

  const bot = await prisma.discordBot.findUnique({ where: { id } });
  if (!bot) return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });

  await prisma.discordBot.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
