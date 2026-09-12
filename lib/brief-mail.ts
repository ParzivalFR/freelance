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
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;line-height:1.6">
        <h2 style="color:#7158ff">Bonjour ${escapeHtml(brief.firstName)},</h2>
        <p>Merci pour votre message. Pour vous proposer quelque chose de juste plutôt qu'un tarif au hasard, j'ai préparé quelques questions sur votre projet.</p>
        <p>Comptez une dizaine de minutes. Aucune question technique, et vous pouvez répondre « je ne sais pas » partout : c'est justement mon rôle de vous guider ensuite.</p>
        <p style="margin:28px 0">
          <a href="${link}" style="background:#7158ff;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold">Répondre aux questions</a>
        </p>
        <p style="font-size:13px;color:#666">Si le bouton ne fonctionne pas, copiez cette adresse dans votre navigateur :<br>${link}</p>
        <p style="font-size:13px;color:#666">Ce lien vous est personnel et reste valable ${BRIEF_VALIDITY_DAYS} jours. Vos réponses sont enregistrées au fur et à mesure, vous pouvez vous interrompre et reprendre plus tard.</p>
        <p style="margin-top:24px">À très vite,<br>Gaël Richard<br><a href="${siteUrl}" style="color:#7158ff">gael-dev.fr</a></p>
      </div>`,
  });
}
