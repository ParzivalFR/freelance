import { auth } from "@/lib/auth";
import {
  createTestimonialEmailSubject,
  createTestimonialEmailTemplate,
} from "@/lib/email-templates/testimonial-request";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tokenId } = body;

    if (!tokenId) {
      return NextResponse.json({ error: "Token ID requis" }, { status: 400 });
    }

    // Récupérer les données du token
    const tokenData = await prisma.testimonialToken.findUnique({
      where: { id: tokenId },
    });

    if (!tokenData) {
      return NextResponse.json({ error: "Token non trouvé" }, { status: 404 });
    }

    // Vérifier si le token a expiré
    if (new Date() > tokenData.expiresAt) {
      return NextResponse.json({ error: "Ce token a expiré" }, { status: 410 });
    }

    // Vérifier si le token a déjà été utilisé
    if (tokenData.isUsed) {
      return NextResponse.json(
        { error: "Ce token a déjà été utilisé" },
        { status: 409 }
      );
    }

    // Configuration Nodemailer pour Infomaniak
    const transporter = nodemailer.createTransport({
      host: "mail.infomaniak.com",
      port: 587,
      secure: false, // true pour port 465, false pour autres ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Préparer les données pour le template
    const testimonialUrl = `${process.env.SITE_URL}/testimonial/${tokenData.token}`;
    const siteUrl = process.env.SITE_URL || "https://freelance.gael-dev.fr";

    const htmlContent = createTestimonialEmailTemplate({
      clientName: tokenData.clientName,
      projectName: tokenData.projectName || undefined,
      testimonialUrl,
      siteUrl,
    });

    const subject = createTestimonialEmailSubject(
      tokenData.clientName,
      tokenData.projectName || undefined
    );

    // Créer le message texte simple en backup
    const textContent = `
Bonjour ${tokenData.clientName},

J'espère que vous êtes satisfait${
      tokenData.projectName
        ? ` de notre travail sur le projet "${tokenData.projectName}"`
        : " de nos services"
    }.

Pourriez-vous prendre quelques minutes pour partager votre expérience ? Votre avis nous aide à améliorer nos services et à rassurer nos futurs clients.

Lien pour laisser votre avis : ${testimonialUrl}

Ce lien est personnel et sécurisé. Il ne peut être utilisé qu'une seule fois et expire dans 30 jours.

Si vous avez des questions, n'hésitez pas à me répondre directement.

Cordialement,
Gael Richard
🌐 ${siteUrl.replace("https://", "")}
✉️ hello@gael-dev.fr
    `.trim();

    // Envoyer l'email
    const info = await transporter.sendMail({
      from: `"Gael Richard" <${process.env.EMAIL_USER}>`,
      to: tokenData.clientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log("Email sent: %s", info.messageId);
    console.log("Email sent to: %s", tokenData.clientEmail);
    console.log("Using email account: %s", process.env.EMAIL_USER);

    // Marquer que l'email a été envoyé
    await prisma.testimonialToken.update({
      where: { id: tokenId },
      data: {
        emailSentAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Email envoyé avec succès",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending testimonial email:", error);

    // Message d'erreur plus détaillé pour faciliter le débogage
    let errorMessage = "Erreur lors de l'envoi de l'email";
    if ((error as { code?: string }).code === "EAUTH") {
      errorMessage =
        "Erreur d'authentification SMTP. Vérifiez les identifiants de connexion et assurez-vous d'utiliser un mot de passe d'application si l'authentification à deux facteurs est activée.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
