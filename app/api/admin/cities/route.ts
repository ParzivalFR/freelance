import { NextRequest, NextResponse } from "next/server";

// API pour l'autocomplétion des villes françaises
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ cities: [] });
    }

    // API gouvernementale française pour les communes
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,centre&format=json&limit=10`,
      {
        headers: {
          'User-Agent': 'FreelanceProspection/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error('Erreur API communes:', response.status);
      return NextResponse.json({ cities: [] });
    }

    const communes = await response.json();

    // Formater les résultats
    const cities = communes.map((commune: any) => ({
      name: commune.nom,
      code: commune.code,
      postalCodes: commune.codesPostaux || [],
      coordinates: commune.centre ? {
        lat: commune.centre.coordinates[1],
        lon: commune.centre.coordinates[0]
      } : null,
      display: `${commune.nom} (${commune.codesPostaux?.[0] || commune.code})`
    }));

    return NextResponse.json({ cities });

  } catch (error) {
    console.error('Erreur API cities:', error);
    return NextResponse.json({ cities: [] });
  }
}