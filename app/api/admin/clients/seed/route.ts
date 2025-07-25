import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Créer des données de test
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const testClients = [
      {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@example.com",
        phone: "+33 1 23 45 67 89",
        company: "Dupont & Co",
        website: "https://dupont-co.com",
        isProfessional: true,
        status: "active",
        subject: "Refonte site e-commerce",
        internalNote: "Client très exigeant mais payeur ponctuel",
        lastContactAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
      },
      {
        firstName: "Marie",
        lastName: "Martin",
        email: "marie.martin@startup.fr",
        phone: "+33 6 78 90 12 34",
        company: "TechStart",
        isProfessional: true,
        status: "prospect",
        subject: "Application mobile",
        internalNote: "Startup prometteuse, attention au budget",
        lastContactAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
      },
      {
        firstName: "Pierre",
        lastName: "Bernard",
        email: "pierre.bernard@gmail.com",
        phone: "+33 1 98 76 54 32",
        address: "123 Rue de la République, 69000 Lyon",
        isProfessional: false,
        status: "inactive",
        subject: "Site vitrine personnel",
        internalNote: "Projet personnel, pas pressé",
        lastContactAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Il y a 30 jours
      },
      {
        firstName: "Sophie",
        lastName: "Rousseau",
        email: "s.rousseau@agence-comm.fr",
        phone: "+33 4 56 78 90 12",
        company: "Agence Comm+",
        website: "https://agence-comm-plus.fr",
        address: "456 Avenue des Champs, 13000 Marseille",
        isProfessional: true,
        status: "active",
        subject: "Plateforme de gestion",
        internalNote: "Partenaire récurrent, très satisfaite",
        lastContactAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hier
      },
      {
        firstName: "Thomas",
        lastName: "Leroy",
        email: "thomas.leroy@freelance.com",
        phone: "+33 7 11 22 33 44",
        isProfessional: false,
        status: "archived",
        subject: "Portfolio photographe",
        internalNote: "Projet terminé, client satisfait",
        lastContactAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Il y a 90 jours
      },
    ];

    // Supprimer les clients de test existants
    await prisma.client.deleteMany({
      where: {
        email: {
          in: testClients.map(c => c.email)
        }
      }
    });

    // Créer les nouveaux clients de test
    const createdClients = await Promise.all(
      testClients.map(client => prisma.client.create({ data: client }))
    );

    return NextResponse.json({
      message: `${createdClients.length} clients de test créés avec succès`,
      clients: createdClients,
    });
  } catch (error) {
    console.error("Erreur lors de la création des données de test:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création des données de test" },
      { status: 500 }
    );
  }
}