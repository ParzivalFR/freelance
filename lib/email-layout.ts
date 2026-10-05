// Gabarit commun des e-mails envoyés par le site, dans la charte du site :
// fond perle, carte blanche, étiquette « // … », titre, bouton pilule noir,
// pied de page avec l'adresse de contact. Tout est en tableaux et styles en
// ligne, seule mise en page fiable dans les clients mail.

const SITE_URL = process.env.SITE_URL ?? "https://gael-dev.fr";
const CONTACT_EMAIL = "hello@gael-dev.fr";

const FONT = "'Instrument Sans', 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "'JetBrains Mono', Menlo, Consolas, monospace";

export const emailColors = {
  perle: "#F5F4F1",
  blanc: "#FFFFFF",
  encre: "#1E1F24",
  gris: "#696A70",
  filet: "#E3E2DE",
  galet: "#ECEBE7",
  kaki: "#4A5A3A",
  kakiClair: "#DADFCF",
};

/** Étiquette façon commentaire de code : `// devis gratuit`. */
export function emailNote(text: string): string {
  return `<span style="display:inline-block;font-family:${MONO};font-size:13px;line-height:1.2;color:${emailColors.kaki};background:${emailColors.kakiClair};padding:6px 10px;border-radius:8px;white-space:nowrap">// ${text}</span>`;
}

/** Mot posé sur une pastille kaki clair, dans un titre. */
export function emailHighlight(text: string): string {
  return `<span style="background:${emailColors.kakiClair};border-radius:6px;padding:0 5px">${text}</span>`;
}

/** Bouton pilule noir. */
export function emailButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${emailColors.encre};color:${emailColors.blanc};font-family:${FONT};font-size:16px;font-weight:700;text-decoration:none;padding:15px 26px;border-radius:999px">${label}</a>`;
}

/** Bloc gris clair pour citer ce que la personne a envoyé. */
export function emailQuote(html: string): string {
  return `<div style="background:${emailColors.galet};border-radius:14px;padding:16px 18px;margin:20px 0;font-size:15px;line-height:1.6">${html}</div>`;
}

/** Tableau clé / valeur (nom, e-mail, budget…). */
export function emailRows(rows: Array<[string, string] | string | null | false | undefined>): string {
  const cells = rows
    .filter((r): r is [string, string] => Array.isArray(r))
    .map(
      ([k, v]) =>
        `<tr><td style="padding:5px 14px 5px 0;color:${emailColors.gris};font-size:14px;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:5px 0;font-size:15px">${v}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${cells}</table>`;
}

export function emailLayout({
  kicker,
  title,
  body,
  cta,
  footer,
  preheader,
}: {
  /** Texte de l'étiquette en haut, sans les « // ». */
  kicker: string;
  /** Titre, HTML autorisé (voir emailHighlight). */
  title: string;
  /** Paragraphes et blocs, HTML. */
  body: string;
  cta?: { label: string; href: string };
  /** Remplace la signature par défaut. */
  footer?: string;
  /** Aperçu affiché dans la boîte de réception, à côté du sujet. */
  preheader?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${title.replace(/<[^>]+>/g, "")}</title>
</head>
<body style="margin:0;padding:0;background:${emailColors.perle};color:${emailColors.encre};font-family:${FONT};line-height:1.6">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${emailColors.perle}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
  <tr><td style="padding:0 4px 18px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle;padding-right:10px"><img src="${SITE_URL}/logo-email.png" width="34" height="34" alt="" style="display:block;width:34px;height:34px"></td>
      <td style="vertical-align:middle;font-size:17px;font-weight:700;color:${emailColors.encre}">Gaël Richard</td>
    </tr></table>
  </td></tr>
  <tr><td style="background:${emailColors.blanc};border:1px solid ${emailColors.filet};border-radius:22px;padding:34px 32px">
    ${emailNote(kicker)}
    <h1 style="margin:18px 0 14px;font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.02em;color:${emailColors.encre}">${title}</h1>
    <div style="font-size:16px;color:${emailColors.encre}">${body}</div>
    ${cta ? `<div style="margin:28px 0 8px">${emailButton(cta.label, cta.href)}</div>` : ""}
  </td></tr>
  <tr><td style="padding:22px 8px 0;font-size:13px;line-height:1.6;color:${emailColors.gris}">
    ${footer ?? `Gaël Richard, développeur freelance<br><a href="${SITE_URL}" style="color:${emailColors.kaki}">gael-dev.fr</a> · <a href="mailto:${CONTACT_EMAIL}" style="color:${emailColors.kaki}">${CONTACT_EMAIL}</a>`}
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
