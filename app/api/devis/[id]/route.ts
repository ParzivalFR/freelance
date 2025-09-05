import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

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

    return NextResponse.json(devis);
  } catch (error) {
    console.error('Erreur lors de la récupération du devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const { status } = await request.json();
    const { id } = await params;
    
    const updateData: any = { status };
    
    // Mettre à jour les dates selon le statut
    if (status === 'sent') {
      updateData.sentAt = new Date();
    } else if (status === 'accepted') {
      updateData.acceptedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date();
    }

    const devis = await prisma.devis.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(devis);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}