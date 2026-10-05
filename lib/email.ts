import nodemailer from 'nodemailer';
import { emailHighlight, emailLayout } from '@/lib/email-layout';
import { escapeHtml } from '@/lib/mailer';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendDevisEmailOptions {
  to: string;
  clientName: string;
  devisNumber: string;
  companyName: string;
  total: number;
  tvaApplicable: boolean;
  pdfBuffer: Buffer;
}

export async function sendDevisEmail({
  to,
  clientName,
  devisNumber,
  companyName,
  total,
  tvaApplicable,
  pdfBuffer,
}: SendDevisEmailOptions) {
  const subject = `Devis ${devisNumber} - ${companyName}`;
  
  const totalText = tvaApplicable ? 'TTC' : 'HT';
  const formattedTotal = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(total);

  const htmlContent = emailLayout({
    kicker: `devis ${devisNumber}`,
    preheader: `${formattedTotal} ${totalText}, détail en pièce jointe.`,
    title: `Bonjour ${escapeHtml(clientName)}, ${emailHighlight("voici votre devis.")}`,
    body: `
      <p style="margin:0 0 14px">Vous trouverez le détail de ma proposition en pièce jointe, au format PDF.</p>
      <div style="background:#ECEBE7;border-radius:14px;padding:16px 18px;margin:20px 0">
        <div style="font-size:14px;color:#696A70">Montant du devis</div>
        <div style="font-size:26px;font-weight:800;letter-spacing:-0.02em">${formattedTotal} <span style="font-size:15px;font-weight:400;color:#696A70">${totalText}</span></div>
      </div>
      <p style="margin:0 0 14px">Ce devis est valable 30 jours. Si un point mérite d'être discuté ou ajusté, répondez simplement à cet e-mail, on en parle.</p>
      <p style="margin:0">À bientôt,<br>Gaël</p>`,
  });

  const textContent = `
Bonjour ${clientName},

J'ai le plaisir de vous adresser votre devis personnalisé (N° ${devisNumber}).

Montant : ${formattedTotal} ${totalText}

Ce devis est valable 30 jours à compter de sa date d'émission.
Vous trouverez tous les détails en pièce jointe au format PDF.

N'hésitez pas à me contacter si vous avez des questions.

Cordialement,
${companyName}
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: `"${companyName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text: textContent,
      html: htmlContent,
      attachments: [
        {
          filename: `devis-${devisNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
}

export async function testEmailConnection() {
  try {
    await transporter.verify();
    return { success: true, message: 'Configuration email valide' };
  } catch (error) {
    console.error('Erreur configuration email:', error);
    return { success: false, message: 'Configuration email invalide' };
  }
}