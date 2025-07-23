import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { createTestimonialEmailTemplate, createTestimonialEmailSubject } from "@/lib/email-templates/testimonial-request";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientEmail, clientName, projectName, sendEmail = false } = body;

    if (!clientEmail || !clientName) {
      return NextResponse.json(
        { error: "Email et nom du client requis" },
        { status: 400 }
      );
    }

    // Vérifier si un token non utilisé existe déjà pour ce client
    const existingToken = await prisma.testimonialToken.findFirst({
      where: {
        clientEmail,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (existingToken) {
      return NextResponse.json({
        token: existingToken.token,
        url: `${process.env.SITE_URL}/testimonial/${existingToken.token}`,
        expiresAt: existingToken.expiresAt,
        message: "Un lien actif existe déjà pour ce client"
      });
    }

    // Créer un nouveau token qui expire dans 30 jours
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const tokenRecord = await prisma.testimonialToken.create({
      data: {
        clientEmail,
        clientName,
        projectName,
        expiresAt,
      },
    });

    const testimonialUrl = `${process.env.SITE_URL}/testimonial/${tokenRecord.token}`;

    let emailResult = null;
    
    // Envoyer l'email automatiquement si demandé
    if (sendEmail) {
      try {
        // Configuration Nodemailer pour Infomaniak
        const transporter = nodemailer.createTransporter({
          host: "mail.infomaniak.com",
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const htmlContent = createTestimonialEmailTemplate({
          clientName: tokenRecord.clientName,
          projectName: tokenRecord.projectName || undefined,
          testimonialUrl,
          siteUrl: process.env.SITE_URL || 'https://freelance.gael-dev.fr',
        });

        const subject = createTestimonialEmailSubject(
          tokenRecord.clientName,
          tokenRecord.projectName || undefined
        );

        const textContent = `
Bonjour ${tokenRecord.clientName},

J'espère que vous êtes satisfait${tokenRecord.projectName ? ` de notre travail sur le projet "${tokenRecord.projectName}"` : ' de nos services'}.

Pourriez-vous prendre quelques minutes pour partager votre expérience ?

Lien pour laisser votre avis : ${testimonialUrl}

Ce lien est personnel et sécurisé.

Cordialement,
Gael Richard
        `.trim();

        const info = await transporter.sendMail({
          from: `"Gael Richard" <${process.env.EMAIL_USER}>`,
          to: tokenRecord.clientEmail,
          subject: subject,
          text: textContent,
          html: htmlContent,
        });

        // Marquer que l'email a été envoyé
        await prisma.testimonialToken.update({
          where: { id: tokenRecord.id },
          data: {
            emailSentAt: new Date(),
          },
        });

        emailResult = { messageId: info.messageId };
        console.log("Auto email sent: %s", info.messageId);
        
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // On continue même si l'email échoue
      }
    }

    return NextResponse.json({
      token: tokenRecord.token,
      url: testimonialUrl,
      expiresAt: tokenRecord.expiresAt,
      message: sendEmail && emailResult 
        ? "Lien généré et email envoyé avec succès" 
        : "Lien de testimonial généré avec succès",
      emailSent: !!emailResult
    });

  } catch (error) {
    console.error("Error creating testimonial token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokens = await prisma.testimonialToken.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limiter à 50 tokens récents
    });

    return NextResponse.json(tokens);

  } catch (error) {
    console.error("Error fetching testimonial tokens:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}