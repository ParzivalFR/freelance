import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateDevisPDF } from '@/lib/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const devis = await prisma.devis.findUnique({
      where: { id }
    });

    if (!devis) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Reformater les données pour le générateur PDF
    const pdfData = {
      devisNumber: devis.devisNumber,
      date: devis.date.toLocaleDateString('fr-FR'),
      validUntil: devis.validUntil.toLocaleDateString('fr-FR'),
      client: {
        firstName: devis.clientFirstName,
        lastName: devis.clientLastName,
        email: devis.clientEmail,
        phone: devis.clientPhone || undefined,
        company: devis.clientCompany || undefined,
        address: devis.clientAddress || undefined,
      },
      companyInfo: {
        name: devis.companyName,
        address: devis.companyAddress,
        phone: devis.companyPhone,
        email: devis.companyEmail,
        siret: devis.companySiret,
      },
      items: JSON.parse(JSON.stringify(devis.items)),
      subtotal: devis.subtotal,
      tvaRate: devis.tvaRate,
      tvaAmount: devis.tvaAmount,
      total: devis.total,
      tvaApplicable: devis.tvaApplicable,
      notes: devis.notes || undefined,
    };

    // Génération du PDF
    const pdfBuffer = await generateDevisPDF(pdfData);

    // Création de la réponse avec le PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${devis.devisNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}