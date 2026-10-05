import { emailHighlight, emailLayout } from "@/lib/email-layout";
import { escapeHtml } from "@/lib/mailer";

interface TestimonialEmailProps {
  clientName: string;
  projectName?: string;
  testimonialUrl: string;
  siteUrl: string;
}

export function createTestimonialEmailTemplate({
  clientName,
  projectName,
  testimonialUrl,
}: TestimonialEmailProps) {
  const firstName = clientName.trim().split(" ")[0];
  return emailLayout({
    kicker: "votre avis",
    preheader: "Trois lignes suffisent, et elles comptent beaucoup.",
    title: `${escapeHtml(firstName)}, ${emailHighlight("à vous de parler.")}`,
    body: `
      <p style="margin:0 0 14px">J'espère que vous êtes content${projectName ? ` de notre collaboration sur <strong>${escapeHtml(projectName)}</strong>` : " de notre collaboration"}.</p>
      <p style="margin:0 0 14px">Un avis de votre part, même court, est ce qui rassure le plus les prochains clients. Trois lignes suffisent : comment ça s'est passé, ce qui vous a marqué, si vous recommanderiez.</p>
      <p style="margin:0;font-size:14px;color:#696A70">Votre avis sera publié sur gael-dev.fr avec votre nom et votre fonction, jamais votre e-mail. Vous pourrez me demander de le retirer à tout moment.<br>Si le bouton ne fonctionne pas : ${testimonialUrl}</p>`,
    cta: { label: "Laisser mon avis", href: testimonialUrl },
  });
}

export function createTestimonialEmailSubject(clientName: string, projectName?: string) {
  const firstName = clientName.trim().split(" ")[0];
  return projectName
    ? `${firstName}, un avis sur ${projectName} ?`
    : `${firstName}, un petit avis sur notre collaboration ?`;
}
