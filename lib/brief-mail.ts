import { emailHighlight, emailLayout } from "@/lib/email-layout";
import { escapeHtml, getMailer } from "@/lib/mailer";

/** Durée de validité d'un lien de brief, en jours. */
export const BRIEF_VALIDITY_DAYS = 30;

/** Email d'invitation contenant le lien privé vers le questionnaire. */
export async function sendBriefInvitation(brief: {
  token: string;
  firstName: string;
  email: string;
}) {
  const siteUrl = process.env.SITE_URL ?? "https://gael-dev.fr";
  const link = `${siteUrl}/brief/${brief.token}`;

  await getMailer().sendMail({
    from: process.env.EMAIL_USER,
    to: brief.email,
    subject: "Quelques questions pour préparer votre devis",
    html: emailLayout({
      kicker: "quelques questions",
      preheader: "Dix minutes pour préparer un devis juste.",
      title: `Bonjour ${escapeHtml(brief.firstName)}, ${emailHighlight("parlons de votre projet.")}`,
      body: `
        <p style="margin:0 0 14px">Merci pour votre message. Pour vous proposer quelque chose de juste plutôt qu'un tarif au hasard, j'ai préparé quelques questions sur votre projet.</p>
        <p style="margin:0 0 14px">Comptez une dizaine de minutes. Aucune question technique, et vous pouvez répondre « je ne sais pas » partout : c'est justement mon rôle de vous guider ensuite.</p>
        <p style="margin:0;font-size:14px;color:#696A70">Ce lien vous est personnel et reste valable ${BRIEF_VALIDITY_DAYS} jours. Vos réponses sont enregistrées au fur et à mesure, vous pouvez vous interrompre et reprendre plus tard.<br>Si le bouton ne fonctionne pas : ${link}</p>`,
      cta: { label: "Répondre aux questions", href: link },
    }),
  });
}
