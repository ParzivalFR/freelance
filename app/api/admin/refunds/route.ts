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

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const requests = await prisma.refundRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bot: { select: { id: true, name: true, plan: true, stripeSubscriptionId: true, stripeSessionId: true, paidAt: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(requests);
}
