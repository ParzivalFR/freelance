import { NextRequest, NextResponse } from 'next/server';
import { generateDevisPDF, type DevisPDFRequest } from '@/lib/pdf-generator';
import { prisma } from '@/lib/prisma';
import { requireAdmin, unauthorizedResponse } from '@/lib/require-admin';

export async function POST(request: NextRequest) {
  try {
    // Écrit en base et sert à l'envoi de mails : réservé à l'admin.
    if (!(await requireAdmin())) return unauthorizedResponse();

    const data: DevisPDFRequest = await request.json();

    // Validation des données
    if (!data.devisNumber || !data.client || !data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Données manquantes pour générer le devis' },
        { status: 400 }
      );
    }

    // Sauvegarde en base de données
    const savedDevis = await prisma.devis.create({
      data: {
        devisNumber: data.devisNumber,
        status: 'draft',
        
        // Informations client
        clientFirstName: data.client.firstName,
        clientLastName: data.client.lastName,
        clientEmail: data.client.email,
        clientPhone: data.client.phone,
        clientCompany: data.client.company,
        clientAddress: data.client.address,
        
        // Informations entreprise
        companyName: data.companyInfo.name,
        companyAddress: data.companyInfo.address,
        companyPhone: data.companyInfo.phone,
        companyEmail: data.companyInfo.email,
        companySiret: data.companyInfo.siret,
        
        // Dates
        date: new Date(data.date.split('/').reverse().join('-')), // Convert DD/MM/YYYY to YYYY-MM-DD
        validUntil: new Date(data.validUntil.split('/').reverse().join('-')),
        
        // Montants
        subtotal: data.subtotal,
        tvaRate: data.tvaRate,
        tvaAmount: data.tvaAmount,
        total: data.total,
        tvaApplicable: data.tvaApplicable,
        
        // Prestations
        items: JSON.parse(JSON.stringify(data.items)),
        
        // Notes
        notes: data.notes,
      },
    });

    // Génération du PDF
    const pdfBuffer = await generateDevisPDF(data);

    // Création de la réponse avec le PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${data.devisNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'X-Devis-Id': savedDevis.id, // ID du devis sauvegardé
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
