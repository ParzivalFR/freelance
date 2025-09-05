import { NextRequest, NextResponse } from 'next/server';
import { generateDevisPDF, type DevisPDFRequest } from '@/lib/pdf-generator';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
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

export async function GET() {
  // Exemple de données pour tester l'API
  const sampleData: DevisPDFRequest = {
    devisNumber: 'DEV-2024-001',
    date: new Date().toLocaleDateString('fr-FR'),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
    client: {
      firstName: 'John',
      lastName: 'Doe',
      company: 'ACME Corp',
      email: 'john@acme.com',
      phone: '01 23 45 67 89',
      address: '123 Rue Example\n75000 Paris',
    },
    companyInfo: {
      name: 'Mon Entreprise',
      address: '456 Avenue Business\n69000 Lyon',
      phone: '04 12 34 56 78',
      email: 'contact@mon-entreprise.fr',
      siret: '12345678901234',
    },
    items: [
      {
        id: '1',
        description: 'Développement site web vitrine responsive',
        quantity: 1,
        unitPrice: 2500,
        total: 2500,
      },
      {
        id: '2',
        description: 'Formation utilisateur et documentation',
        quantity: 2,
        unitPrice: 500,
        total: 1000,
      },
    ],
    subtotal: 3500,
    tvaRate: 20,
    tvaAmount: 700,
    total: 4200,
    tvaApplicable: true,
    notes: 'Livraison prévue sous 4 semaines. Formation incluse. Maintenance 1 an offerte.',
  };

  try {
    const pdfBuffer = await generateDevisPDF(sampleData);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-exemple.pdf"`,
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