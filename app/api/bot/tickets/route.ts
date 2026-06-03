import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// NOTE: Le modèle Ticket n'existe pas encore dans le schéma Prisma (bot-engine/prisma/schema.prisma).
// Cette route retourne des données vides en attendant que le modèle soit créé.
// Pour l'activer : ajouter le modèle Ticket au schéma, lancer prisma migrate dev, puis
// décommenter la logique ci-dessous et remplacer le return du fallback.

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const botId = searchParams.get("botId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status"); // "open" | "closed" | null

  if (!botId) {
    return NextResponse.json({ error: "botId manquant" }, { status: 400 });
  }

  try {
    const bot = await prisma.discordBot.findFirst({
      where: { id: botId, userId: session.user.id },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot introuvable" }, { status: 404 });
    }

    // Modèle Ticket absent du schéma Prisma — retour vide en attendant la migration
    void status;
    void page;
    void limit;

    return NextResponse.json({
      tickets: [],
      total: 0,
      stats: { open: 0, closed: 0, avgResponseTime: null },
    });

    /*
    // Une fois le modèle Ticket ajouté, remplacer le bloc ci-dessus par :
    const skip = (page - 1) * limit;
    const where = {
      botId: bot.id,
      ...(status === "open" && { status: "OPEN" }),
      ...(status === "closed" && { status: "CLOSED" }),
    };

    const [tickets, total, open, closed] = await Promise.all([
      prisma.ticket.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { botId: bot.id, status: "OPEN" } }),
      prisma.ticket.count({ where: { botId: bot.id, status: "CLOSED" } }),
    ]);

    return NextResponse.json({ tickets, total, stats: { open, closed, avgResponseTime: null } });
    */
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
