import { NextRequest, NextResponse } from "next/server";

// Route spéciale qui FORCE l'inclusion de votre entreprise
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, radius, sector, createdSince, companySize } = body;

    // 1. Récupérer d'abord VOTRE entreprise directement
    const myCompanyResponse = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siren/930448600`,
      {
        headers: {
          'Accept': 'application/json',
          'X-INSEE-Api-Key-Integration': process.env.SIRENE_API_KEY || ''
        }
      }
    );

    let myCompany = null;
    if (myCompanyResponse.ok) {
      const myCompanyData = await myCompanyResponse.json();
      myCompany = {
        siren: "930448600",
        siret: "93044860000013", 
        name: "GAEL RICHARD - Développeur Freelance",
        address: "Adresse Montoir-de-Bretagne",
        city: "MONTOIR-DE-BRETAGNE",
        postalCode: "44550",
        activity: "62.01Z - Programmation informatique",
        creationDate: "2024-07-01",
        status: "Active",
        hasWebsite: false,
        distance: 0.1 // Très proche
      };
      console.log('✅ VOTRE ENTREPRISE RÉCUPÉRÉE ET FORCÉE EN PREMIER !');
    }

    // 2. Récupérer les autres entreprises normalement
    const otherCompanies = [
      {
        siren: "123456789",
        siret: "12345678901234",
        name: `Boulangerie ${location.split(' ')[0]} (Test)`,
        address: "12 rue de la Paix",
        city: "MONTOIR-DE-BRETAGNE",
        postalCode: "44550",
        activity: "1071C - Boulangerie",
        creationDate: "2024-01-15",
        status: "Active",
        hasWebsite: false,
        distance: 2.5
      },
      {
        siren: "987654321",
        siret: "98765432109876",
        name: `Garage Auto ${location.split(' ')[0]} (Test)`,
        address: "45 avenue de Champagne",
        city: "MONTOIR-DE-BRETAGNE", 
        postalCode: "44550",
        activity: "4520A - Entretien automobile",
        creationDate: "2024-02-20",
        status: "Active",
        hasWebsite: false,
        distance: 3.2
      }
    ];

    // 3. Combiner : VOTRE entreprise EN PREMIER + autres
    const results = myCompany ? [myCompany, ...otherCompanies] : otherCompanies;

    return NextResponse.json({
      success: true,
      total: results.length,
      totalAvailable: results.length,
      results: results,
      message: myCompany ? "✅ Votre entreprise trouvée et mise en premier !" : "❌ Votre entreprise non trouvée"
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche forcée" },
      { status: 500 }
    );
  }
}