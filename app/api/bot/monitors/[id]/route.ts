import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/monitor-crypto";
import { NextResponse } from "next/server";

const DB_TYPES = ["POSTGRES", "MYSQL", "MARIADB"];

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

  const { name, interval, alertChannelId, alertRoleId, active, target, sshConfig } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (interval !== undefined) data.interval = interval;
  if (alertChannelId !== undefined) data.alertChannelId = alertChannelId || null;
  if (alertRoleId !== undefined) data.alertRoleId = alertRoleId || null;
  if (active !== undefined) data.active = active;

  // Only update credentials if provided (non-empty)
  if (target) {
    data.target = DB_TYPES.includes(monitor.type) ? encrypt(target) : target;
    // Reset status so bot re-checks immediately
    data.status = "PENDING";
  }
  if (sshConfig) {
    data.sshConfig = encrypt(JSON.stringify(sshConfig));
  }
  if (sshConfig === null) {
    // Explicitly removing SSH
    data.sshConfig = null;
  }

  const updated = await prisma.monitor.update({ where: { id }, data });
  return NextResponse.json({
    monitor: {
      ...updated,
      target: DB_TYPES.includes(updated.type) ? `[${updated.type} — connexion chiffrée]` : updated.target,
      sshConfig: updated.sshConfig ? true : null,
    },
  });
}
