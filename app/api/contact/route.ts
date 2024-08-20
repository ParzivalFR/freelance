import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const body = await request.json();
  const { firstName, lastName, email, message } = body;

  // Configuration du transporteur Nodemailer
  const transporter = nodemailer.createTransport({
    host: "mail.infomaniak.com",
    port: 465,
    secure: true, // Utilisation de SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Facultatif : utile si vous rencontrez des problèmes de certificat
    },
  });

  // Personnalisation du message en HTML
  const customMessage = `
  <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #7947FF; border-radius: 5px;">
        <h2>🍀 Nouveau message de <span style="color: #7947FF;">${firstName} ${lastName}</span></h2>
        <p style="font-size: 16px;">Vous avez reçu un nouveau message depuis votre formulaire de contact :</p>
        <table style="width: 100%;">
          <tr>
            <td style="font-weight: bold; padding: 5px 0;">Nom : ${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 5px 0;">Email : ${email}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 5px 0;">Message :</td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">
              <div style="background-color: #f9f9f9; padding: 10px; border-left: 5px solid #7947FF; margin: 0;">
                ${message}
              </div>
            </td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Cordialement,</p>
        <p style="margin: 0;">Votre partenaire Gael Richard.</p>
      </div>
    </body>
  </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    replyTo: `${firstName} ${lastName} <${email}>`,
    to: process.env.EMAIL_USER,
    subject: `🚀 Nouveau message de ${firstName} ${lastName}.`,
    html: customMessage,
  };

  // Personnalisation du message de confirmation pour le destinataire
  const confirmationMessage = `
  <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #7947FF; border-radius: 5px;">
        <h2>Merci, ${firstName} ${lastName}!</h2>
        <p style="font-size: 16px;">Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p style="margin-top: 20px;">Voici un résumer de ce que vous venez d'envoyer :</p>
        <table style="width: 100%;">
          <tr>
            <td style="font-weight: bold; padding: 5px 0;">Nom : ${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 5px 0;">Email : ${email}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 5px 0;">Message :</td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">
              <div style="background-color: #f9f9f9; padding: 10px; border-left: 5px solid #7947FF; margin: 0;">
                ${message}
              </div>
            </td>
          </tr>
        </table>
        <p style="margin-top: 20px;">Cordialement,</p>
        <p style="margin: 0;">Votre partenaire Gael Richard.</p>
      </div>
    </body>
  </html>
  `;

  const confirmationMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirmation de réception de votre message",
    html: confirmationMessage,
  };

  try {
    // Envoyer l'email principal
    let info = await transporter.sendMail(mailOptions);
    console.log("🍀 Email envoyé avec succès : ", info.response);

    // Envoyer l'email de confirmation au destinataire
    let confirmationInfo = await transporter.sendMail(confirmationMailOptions);
    console.log(
      "🍀 Email de confirmation envoyé avec succès : ",
      confirmationInfo.response
    );

    return NextResponse.json(
      { message: "🚀 Email envoyé avec succès !" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("🛑 Erreur lors de l'envoi : ", err);
    return NextResponse.json(
      { error: `🛑 Erreur lors de l'envoi : ${err.message}` },
      { status: 500 }
    );
  }
}
