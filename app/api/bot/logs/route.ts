import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Placeholder — connecter à un modèle BotLog Prisma quand il sera créé
  return NextResponse.json({ logs: [] });
}
