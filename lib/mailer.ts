import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

/**
 * Transporteur SMTP Infomaniak, créé au premier envoi.
 *
 * Même réglage que la route de contact, qui fonctionne en production. Il est
 * créé à la demande et non au chargement du module : instancié trop tôt, il
 * ferait échouer le build quand les identifiants ne sont pas fournis.
 */
export function getMailer(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: "mail.infomaniak.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  return transporter;
}

/**
 * Neutralise le HTML d'un texte saisi par un visiteur avant de l'insérer dans
 * un email. Sans ça, un message contenant des balises peut réécrire l'email
 * reçu, y compris y glisser un faux lien.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Même chose, en conservant les retours à la ligne saisis. */
export function escapeHtmlMultiline(value: unknown): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}
