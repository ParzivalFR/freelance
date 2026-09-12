import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { escapeHtml, escapeHtmlMultiline, getMailer } from "@/lib/mailer";

/**
 * Formulaire de contact de la landing.
 *
 * Le message est enregistré comme prospect avant tout envoi d'email : un
 * incident SMTP ne doit pas faire disparaître une demande entrante.
 */

const contactSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  company: z.string().trim().max(100).optional(),
  projectType: z.string().trim().max(60).optional(),
  budget: z.string().trim().max(60).optional(),
  message: z.string().trim().min(20).max(1000),
});

/** Libellés lisibles : le formulaire envoie des valeurs techniques. */
const PROJECT_TYPES: Record<string, string> = {
  "site-vitrine": "Site vitrine",
  "e-commerce": "E-commerce",
  "application-web": "Application web",
  refonte: "Refonte de site",
  maintenance: "Maintenance",
  autre: "Autre",
};

const BUDGETS: Record<string, string> = {
  "500-1500": "500 € - 1 500 €",
  "1500-3000": "1 500 € - 3 000 €",
  "3000-5000": "3 000 € - 5 000 €",
  "5000+": "5 000 € +",
  "a-discuter": "À discuter",
};

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Formulaire incomplet ou invalide." },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, company, message } = parsed.data;
  const projectType = parsed.data.projectType
    ? (PROJECT_TYPES[parsed.data.projectType] ?? parsed.data.projectType)
    : null;
  const budget = parsed.data.budget
    ? (BUDGETS[parsed.data.budget] ?? parsed.data.budget)
    : null;

  const fullName = `${firstName} ${lastName}`;
  const subject = [projectType, budget].filter(Boolean).join(" — ") || null;

  // Le contact devient une fiche prospect, pour que rien ne repose sur un
  // email qu'on pourrait archiver ou perdre.
  try {
    await prisma.client.upsert({
      where: { email },
      create: {
        firstName,
        lastName,
        email,
        company: company || null,
        isProfessional: Boolean(company),
        status: "prospect",
        subject,
        internalNote: message,
        lastContactAt: new Date(),
      },
      update: {
        lastContactAt: new Date(),
        ...(subject ? { subject } : {}),
        ...(company ? { company } : {}),
      },
    });
  } catch (error) {
    console.error("🛑 Prospect non enregistré :", error);
  }

  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });
  const destination =
    settings?.notificationEmail ?? settings?.email ?? process.env.EMAIL_USER;
  const signature =
    settings?.emailSignature ?? "Cordialement,\nVotre partenaire Gael Richard.";
  const siteUrl = process.env.SITE_URL ?? "https://gael-dev.fr";

  // Toutes les valeurs saisies sont échappées : un message contenant des
  // balises ne doit pas pouvoir réécrire l'email reçu.
  const details = `
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:4px 0"><strong>Nom</strong></td><td>${escapeHtml(fullName)}</td></tr>
      <tr><td style="padding:4px 0"><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      ${company ? `<tr><td style="padding:4px 0"><strong>Entreprise</strong></td><td>${escapeHtml(company)}</td></tr>` : ""}
      ${projectType ? `<tr><td style="padding:4px 0"><strong>Type de projet</strong></td><td>${escapeHtml(projectType)}</td></tr>` : ""}
      ${budget ? `<tr><td style="padding:4px 0"><strong>Budget</strong></td><td>${escapeHtml(budget)}</td></tr>` : ""}
    </table>
    <div style="background:#f9f9f9;padding:12px;border-left:5px solid #7158ff;margin-top:16px">
      ${escapeHtmlMultiline(message)}
    </div>`;

  try {
    const mailer = getMailer();

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      replyTo: `${fullName} <${email}>`,
      to: destination,
      subject: `🚀 Nouveau message de ${fullName}${projectType ? ` — ${projectType}` : ""}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#333;line-height:1.6;border:1px solid #7158ff;border-radius:8px;padding:24px">
          <h2>🍀 Nouveau message de <span style="color:#7158ff">${escapeHtml(fullName)}</span></h2>
          ${details}
          <p style="margin-top:24px">
            <a href="${siteUrl}/admin/briefs" style="color:#7158ff">Lui envoyer un questionnaire de cadrage</a>
          </p>
        </div>`,
    });

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Votre message est bien arrivé",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#333;line-height:1.6;border:1px solid #7158ff;border-radius:8px;padding:24px">
          <h2>Merci ${escapeHtml(firstName)} !</h2>
          <p>J'ai bien reçu votre message et je vous réponds sous 24 heures.</p>
          <p>Voici ce que vous venez de m'envoyer :</p>
          ${details}
          <p style="margin-top:24px">${escapeHtmlMultiline(signature)}</p>
        </div>`,
    });
  } catch (error) {
    console.error("🛑 Erreur lors de l'envoi du contact :", error);
    // La demande est enregistrée en base : on ne renvoie pas d'échec au
    // visiteur, il n'y peut rien et relancerait pour rien.
  }

  return NextResponse.json({ message: "🚀 Message envoyé !" });
}
