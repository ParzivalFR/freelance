import { NextRequest, NextResponse } from "next/server";

// Route de test pour rechercher directement un SIRET/SIREN
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siren = searchParams.get('siren');
    const siret = searchParams.get('siret');
    
    if (!siren && !siret) {
      return NextResponse.json({ error: "Fournissez un SIREN ou SIRET" });
    }

    let searchUrl;
    if (siret) {
      searchUrl = `https://api.insee.fr/api-sirene/3.11/siret/${siret}`;
    } else {
      searchUrl = `https://api.insee.fr/api-sirene/3.11/siren/${siren}`;
    }

    console.log('Recherche directe:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-INSEE-Api-Key-Integration': process.env.SIRENE_API_KEY || ''
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `Erreur ${response.status}`, 
        details: errorText 
      });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Erreur test SIRET:', error);
    return NextResponse.json({ error: "Erreur serveur" });
  }
}