import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, unauthorizedResponse } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { BRIEF_VALIDITY_DAYS, sendBriefInvitation } from "@/lib/brief-mail";

const createSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).default(""),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(120).optional(),
  clientId: z.string().trim().optional(),
  /** Envoyer tout de suite l'email contenant le lien. */
  sendEmail: z.boolean().default(false),
});

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse();

  const briefs = await prisma.brief.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(briefs);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse();

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Prénom et email valides requis." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + BRIEF_VALIDITY_DAYS);

  const brief = await prisma.brief.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      clientId: data.clientId || null,
      expiresAt,
    },
  });

  if (!data.sendEmail) {
    return NextResponse.json(brief);
  }

  try {
    await sendBriefInvitation(brief);
    const updated = await prisma.brief.update({
      where: { id: brief.id },
      data: { emailSentAt: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("🛑 Lien de brief créé mais email non envoyé :", error);
    // Le lien existe : on le renvoie quand même pour qu'il puisse être copié
    // et transmis à la main.
    return NextResponse.json({ ...brief, emailError: true });
  }
}
