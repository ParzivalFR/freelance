import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    const where = status ? { status } : {};
    
    const [devis, total] = await Promise.all([
      prisma.devis.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          devisNumber: true,
          status: true,
          clientFirstName: true,
          clientLastName: true,
          clientEmail: true,
          clientCompany: true,
          total: true,
          tvaApplicable: true,
          date: true,
          validUntil: true,
          createdAt: true,
          sentAt: true,
          acceptedAt: true,
          rejectedAt: true,
        }
      }),
      prisma.devis.count({ where })
    ]);

    return NextResponse.json({
      devis,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}