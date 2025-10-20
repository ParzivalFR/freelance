import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET - Récupérer les paramètres
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    let settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    // Si aucun paramètre n'existe, créer un par défaut
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "default",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des paramètres" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    // Vérifier si les paramètres existent
    let settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      // Créer les paramètres s'ils n'existent pas
      settings = await prisma.settings.create({
        data: {
          id: "default",
          ...body,
        },
      });
    } else {
      // Mettre à jour les paramètres existants
      settings = await prisma.settings.update({
        where: { id: "default" },
        data: body,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    );
  }
}
