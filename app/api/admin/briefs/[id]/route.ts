import { NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { sendBriefInvitation } from "@/lib/brief-mail";

/** Renvoie l'email d'invitation pour un lien déjà créé. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return unauthorizedResponse();

  const { id } = await params;
  const brief = await prisma.brief.findUnique({ where: { id } });
  if (!brief) {
    return NextResponse.json({ error: "Brief introuvable." }, { status: 404 });
  }
  if (brief.status === "submitted") {
    return NextResponse.json(
      { error: "Ce brief a déjà été complété." },
      { status: 409 },
    );
  }

  try {
    await sendBriefInvitation(brief);
  } catch (error) {
    console.error("🛑 Renvoi du lien de brief impossible :", error);
    return NextResponse.json(
      { error: "L'email n'a pas pu être envoyé." },
      { status: 502 },
    );
  }

  const updated = await prisma.brief.update({
    where: { id },
    data: { emailSentAt: new Date() },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return unauthorizedResponse();

  const { id } = await params;
  await prisma.brief.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
