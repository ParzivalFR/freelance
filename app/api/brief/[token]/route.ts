import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { escapeHtml, escapeHtmlMultiline, getMailer } from "@/lib/mailer";
import { BRIEF_QUESTIONS, BRIEF_SECTIONS } from "@/lib/brief-questions";

/**
 * Réception des réponses au questionnaire de cadrage.
 *
 * Route publique, protégée par le jeton du lien : on n'accepte que les clés de
 * questions connues, et on plafonne la taille des réponses.
 */

const answerSchema = z.union([
  z.string().max(5000),
  z.array(z.string().max(500)).max(50),
]);

const bodySchema = z.object({
  answers: z.record(z.string(), answerSchema),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Réponses invalides." }, { status: 400 });
  }

  const brief = await prisma.brief.findUnique({ where: { token } });
  if (!brief) {
    return NextResponse.json({ error: "Lien inconnu." }, { status: 404 });
  }
  if (brief.status === "submitted") {
    return NextResponse.json(
      { error: "Ce questionnaire a déjà été envoyé." },
      { status: 409 },
    );
  }
  if (new Date() > brief.expiresAt) {
    return NextResponse.json({ error: "Ce lien a expiré." }, { status: 410 });
  }

  // On ne garde que les questions réellement définies : une clé inventée
  // n'atteindra jamais la base ni l'email.
  const known = new Set(BRIEF_QUESTIONS.map((question) => question.id));
  const answers: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(parsed.data.answers)) {
    if (known.has(key)) answers[key] = value;
  }

  const missing = BRIEF_QUESTIONS.filter((question) => {
    if (!question.required) return false;
    const value = answers[question.id];
    return Array.isArray(value) ? value.length === 0 : !value?.trim();
  });
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Réponse manquante : ${missing[0].label}` },
      { status: 400 },
    );
  }

  await prisma.brief.update({
    where: { id: brief.id },
    data: { answers, status: "submitted", submittedAt: new Date() },
  });

  // Le brief est enregistré : à partir d'ici, un échec d'email ne doit plus
  // faire croire au prospect que ses réponses sont perdues.
  const fullName = `${brief.firstName} ${brief.lastName}`.trim();
  const siteUrl = process.env.SITE_URL ?? "https://gael-dev.fr";

  const recap = BRIEF_SECTIONS.map((section) => {
    const lines = section.questions
      .map((question) => {
        const value = answers[question.id];
        const text = Array.isArray(value) ? value.join(", ") : value;
        if (!text || !String(text).trim()) return null;
        return `<p style="margin:0 0 12px"><strong>${escapeHtml(question.label)}</strong><br>${escapeHtmlMultiline(text)}</p>`;
      })
      .filter(Boolean);
    if (lines.length === 0) return "";
    return `<h3 style="color:#7158ff;margin:24px 0 8px">${escapeHtml(section.title)}</h3>${lines.join("")}`;
  }).join("");

  try {
    const mailer = getMailer();
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });
    const destination =
      settings?.notificationEmail ?? settings?.email ?? process.env.EMAIL_USER;

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: destination,
      replyTo: `${fullName} <${brief.email}>`,
      subject: `📋 Brief complété par ${fullName}${brief.company ? ` (${brief.company})` : ""}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#333;line-height:1.6">
          <h2 style="color:#7158ff">Nouveau brief : ${escapeHtml(fullName)}</h2>
          <p>
            ${escapeHtml(brief.email)}${brief.phone ? ` — ${escapeHtml(brief.phone)}` : ""}
            ${brief.company ? `<br>${escapeHtml(brief.company)}` : ""}
          </p>
          ${recap}
          <p style="margin-top:24px">
            <a href="${siteUrl}/admin/briefs" style="color:#7158ff">Ouvrir dans l'administration</a>
          </p>
        </div>`,
    });

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: brief.email,
      subject: "Vos réponses sont bien arrivées",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;line-height:1.6">
          <h2 style="color:#7158ff">Merci ${escapeHtml(brief.firstName)} !</h2>
          <p>J'ai bien reçu vos réponses. Je les lis attentivement et je reviens vers vous sous 24 heures avec une proposition claire et chiffrée.</p>
          <p>Si vous avez oublié quelque chose ou si un détail vous revient, répondez simplement à cet email.</p>
          <p style="margin-top:24px">Gaël Richard<br><a href="${siteUrl}" style="color:#7158ff">gael-dev.fr</a></p>
        </div>`,
    });
  } catch (error) {
    console.error("🛑 Brief enregistré mais email non envoyé :", error);
  }

  return NextResponse.json({ ok: true });
}
