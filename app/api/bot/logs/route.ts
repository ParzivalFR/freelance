import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");
  if (!botId) {
    return NextResponse.json({ error: "botId manquant" }, { status: 400 });
  }

  const logs = await prisma.botLog.findMany({
    where: { botId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, message: true, level: true, createdAt: true },
  });

  return NextResponse.json({ logs: logs.reverse() });
}
