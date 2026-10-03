import { getPublicStatus } from "@/lib/public-status";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const data = await getPublicStatus(botId);
  if (!data) {
    return NextResponse.json({ error: "Page de statut introuvable" }, { status: 404 });
  }
  return NextResponse.json(data);
}
