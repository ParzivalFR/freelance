import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, name, role, review, rating, avatarUrl } = body;

    if (!token || !name || !role || !review) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    if (review.length < 20) {
      return NextResponse.json(
        { error: "L'avis doit contenir au moins 20 caractères" },
        { status: 400 }
      );
    }

    // Vérifier que le token existe et est valide
    const tokenData = await prisma.testimonialToken.findUnique({
      where: { token },
    });

    if (!tokenData) {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 404 }
      );
    }

    // Vérifier si le token a expiré
    if (new Date() > tokenData.expiresAt) {
      return NextResponse.json(
        { error: "Ce lien a expiré" },
        { status: 410 }
      );
    }

    // Vérifier si le token a déjà été utilisé
    if (tokenData.isUsed) {
      return NextResponse.json(
        { error: "Ce lien a déjà été utilisé" },
        { status: 409 }
      );
    }

    // Créer le testimonial et marquer le token comme utilisé
    const result = await prisma.$transaction(async (tx) => {
      // Créer le testimonial
      const testimonial = await tx.testimonial.create({
        data: {
          name,
          role,
          review,
          rating: rating || 5,
          imgUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name.toLowerCase().replace(/\s+/g, "")}&backgroundColor=3b82f6,ef4444,10b981,f59e0b,8b5cf6&textColor=ffffff`,
        },
      });

      // Marquer le token comme utilisé
      await tx.testimonialToken.update({
        where: { token },
        data: {
          isUsed: true,
          usedAt: new Date(),
          testimonialId: testimonial.id,
        },
      });

      return testimonial;
    });

    return NextResponse.json({
      message: "Testimonial créé avec succès",
      testimonial: result,
    });

  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}