import nodemailer from 'nodemailer';

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

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Devis ${devisNumber}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #2d3748;
                margin-bottom: 5px;
            }
            .devis-number {
                font-size: 18px;
                color: #4a5568;
            }
            .greeting {
                margin-bottom: 20px;
            }
            .amount {
                background: #f7fafc;
                padding: 15px;
                border-left: 4px solid #3182ce;
                margin: 20px 0;
                border-radius: 4px;
            }
            .amount-value {
                font-size: 20px;
                font-weight: bold;
                color: #2d3748;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                font-size: 14px;
                color: #718096;
                text-align: center;
            }
            .cta-button {
                display: inline-block;
                background: #3182ce;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="company-name">${companyName}</div>
                <div class="devis-number">Devis N° ${devisNumber}</div>
            </div>
            
            <div class="greeting">
                <p>Bonjour ${clientName},</p>
                
                <p>J'ai le plaisir de vous adresser votre devis personnalisé. Vous trouverez tous les détails de notre proposition en pièce jointe.</p>
            </div>
            
            <div class="amount">
                <div>Montant du devis :</div>
                <div class="amount-value">${formattedTotal} ${totalText}</div>
            </div>
            
            <p>Ce devis est valable 30 jours à compter de sa date d'émission. N'hésitez pas à me contacter si vous avez des questions ou souhaitez discuter de certains points.</p>
            
            <p>Je reste à votre disposition pour tout complément d'information.</p>
            
            <p>Cordialement,<br>
            ${companyName}</p>
            
            <div class="footer">
                <p>Cet email a été envoyé automatiquement depuis notre système de gestion.</p>
                <p>Merci de ne pas répondre directement à cet email.</p>
            </div>
        </div>
    </body>
    </html>
  `;

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