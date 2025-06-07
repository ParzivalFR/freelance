// app/api/quotes/[id]/pdf/route.ts
import { getQuoteById } from "@/app/actions/quotes";
import { QuoteDocument } from "@/components/pdf/QuoteDocument";
import { auth } from "@/lib/auth";
import { renderToStream } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    // Récupérer le devis
    const quote = await getQuoteById(params.id);
    if (!quote) {
      return new NextResponse("Devis non trouvé", { status: 404 });
    }

    // Générer le PDF
    const stream = await renderToStream(QuoteDocument({ quote }));

    // Nom du fichier
    const fileName = `${quote.number}_${quote.client.lastName}.pdf`;

    // Retourner le PDF
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}

// Optionnel : endpoint pour preview (inline au lieu d'attachment)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const quote = await getQuoteById(params.id);
    if (!quote) {
      return new NextResponse("Devis non trouvé", { status: 404 });
    }

    const stream = await renderToStream(QuoteDocument({ quote }));

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline", // Pour affichage direct
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
