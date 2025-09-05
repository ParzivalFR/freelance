import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
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

    if (devis.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Seuls les devis acceptés peuvent être convertis en facture' },
        { status: 400 }
      );
    }

    // Générer le numéro de facture
    const currentYear = new Date().getFullYear();
    const lastFacture = await prisma.facture.findFirst({
      where: {
        factureNumber: {
          startsWith: `FAC-${currentYear}-`
        }
      },
      orderBy: { factureNumber: 'desc' }
    });

    let nextNumber = 1;
    if (lastFacture) {
      const lastNumber = parseInt(lastFacture.factureNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const factureNumber = `FAC-${currentYear}-${String(nextNumber).padStart(3, '0')}`;

    // Créer la facture
    const facture = await prisma.facture.create({
      data: {
        factureNumber,
        status: 'pending',
        devisId: devis.id,
        
        // Copier les informations du devis
        clientFirstName: devis.clientFirstName,
        clientLastName: devis.clientLastName,
        clientEmail: devis.clientEmail,
        clientPhone: devis.clientPhone,
        clientCompany: devis.clientCompany,
        clientAddress: devis.clientAddress,
        
        companyName: devis.companyName,
        companyAddress: devis.companyAddress,
        companyPhone: devis.companyPhone,
        companyEmail: devis.companyEmail,
        companySiret: devis.companySiret,
        
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        
        subtotal: devis.subtotal,
        tvaRate: devis.tvaRate,
        tvaAmount: devis.tvaAmount,
        total: devis.total,
        tvaApplicable: devis.tvaApplicable,
        
        items: JSON.parse(JSON.stringify(devis.items)),
        notes: devis.notes,
      }
    });

    return NextResponse.json({
      success: true,
      facture: {
        id: facture.id,
        factureNumber: facture.factureNumber,
        total: facture.total,
        date: facture.date,
        dueDate: facture.dueDate,
      }
    });

  } catch (error) {
    console.error('Erreur lors de la conversion en facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la conversion en facture' },
      { status: 500 }
    );
  }
}