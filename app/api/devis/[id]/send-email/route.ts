import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateDevisPDF } from '@/lib/pdf-generator';
import { sendDevisEmail } from '@/lib/email';

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

    // Générer le PDF
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

    const pdfBuffer = await generateDevisPDF(pdfData);

    // Envoyer l'email
    await sendDevisEmail({
      to: devis.clientEmail,
      clientName: `${devis.clientFirstName} ${devis.clientLastName}`,
      devisNumber: devis.devisNumber,
      companyName: devis.companyName,
      total: devis.total,
      tvaApplicable: devis.tvaApplicable,
      pdfBuffer,
    });

    // Mettre à jour le statut du devis si c'était un brouillon
    if (devis.status === 'draft') {
      await prisma.devis.update({
        where: { id },
        data: { 
          status: 'sent',
          sentAt: new Date()
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email envoyé avec succès' 
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}