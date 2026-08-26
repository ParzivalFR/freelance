import { auth } from "@/lib/auth";
import { testEmailConnection } from "@/lib/email";
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

/** Vérifie que le SMTP répond — sans envoyer le moindre email. */
export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const result = await testEmailConnection();
  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}
