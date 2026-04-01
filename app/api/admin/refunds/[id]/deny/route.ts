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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const adminNote = (body.adminNote as string | undefined)?.trim() || null;

  const refundRequest = await prisma.refundRequest.findUnique({ where: { id } });

  if (!refundRequest) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }
  if (refundRequest.status !== "PENDING") {
    return NextResponse.json({ error: "Cette demande a déjà été traitée" }, { status: 400 });
  }

  await prisma.refundRequest.update({
    where: { id },
    data: {
      status: "DENIED",
      adminNote,
      processedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
