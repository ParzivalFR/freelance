import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/require-admin";

// Types pour l'API Sirene
interface SireneEtablissement {
  siren: string;
  siret: string;
  uniteLegale: {
    denominationUniteLegale: string;
    activitePrincipaleUniteLegale: string;
    dateCreationUniteLegale: string;
    categorieEntreprise: string;
    etatAdministratifUniteLegale: string;
    prenom1UniteLegale?: string;
    nomUniteLegale?: string;
  };
  adresseEtablissement: {
    numeroVoieEtablissement: string;
    typeVoieEtablissement: string;
    libelleVoieEtablissement: string;
    codePostalEtablissement: string;
    libelleCommuneEtablissement: string;
    coordonneeLambertAbscisseEtablissement: string;
    coordonneeLambertOrdonneeEtablissement: string;
  };
  periodesEtablissement: Array<{
    dateFin: string | null;
    dateDebut: string;
    etatAdministratifEtablissement: string;
  }>;
}

interface SireneResponse {
  header: {
    statut: number;
    message: string;
    total: number;
    debut: number;
    nombre: number;
  };
  etablissements: SireneEtablissement[];
}

// Fonction pour calculer la distance entre deux points GPS
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Conversion Lambert 93 vers GPS (formule plus précise)
function lambertToGPS(x: number, y: number): { lat: number; lon: number } {
  // Paramètres Lambert 93
  const n = 0.725607765;
  const c = 11754255.426;
  const xs = 700000;
  const ys = 12655612.05;
  const e = 0.081819191;
  const lc = 0.04079234433; // 3 degrés en radians

  // Conversion vers latitude/longitude
  const r = Math.sqrt((x - xs) * (x - xs) + (c - (y - ys)) * (c - (y - ys)));
  const gamma = Math.atan((x - xs) / (c - (y - ys)));
  const lon = lc + gamma / n;

  const latIso = -Math.log(r / c) / n;
  const e2 = e * e;
  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const e8 = e6 * e2;

  // Calcul itératif de la latitude
  let lat = 2 * Math.atan(Math.exp(latIso)) - Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    const sinLat = Math.sin(lat);
    lat =
      2 *
        Math.atan(
          Math.exp(
            latIso + (e / 2) * Math.log((1 + e * sinLat) / (1 - e * sinLat))
          )
        ) -
      Math.PI / 2;
  }

  return {
    lat: (lat * 180) / Math.PI,
    lon: (lon * 180) / Math.PI,
  };
}

// Géocodage simplifié et plus fiable
async function geocodeAddress(address: string): Promise<{
  lat: number;
  lon: number;
  postalCode: string;
  cityName: string;
} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address + ", France"
      )}&limit=1&addressdetails=1`,
      {
        headers: {
          "User-Agent": "FreelanceProspection/1.0",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.length === 0) return null;

    const result = data[0];
    const postalCode = result.address?.postcode || "";
    const cityName =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      "";

    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      postalCode,
      cityName: cityName.toUpperCase(),
    };
  } catch (error) {
    console.error("Erreur géocodage:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await requireAdmin()) return unauthorizedResponse();

    const body = await request.json();
    const { location, radius, sector, createdSince, companySize } = body;

    // Géocodage de la localisation de base
    const baseCoords = await geocodeAddress(location);
    if (!baseCoords) {
      return NextResponse.json(
        { error: "Impossible de géolocaliser l'adresse" },
        { status: 400 }
      );
    }

    // Construction de la requête Sirene - SIMPLIFIÉE ET CORRIGÉE
    let sireneQuery = `etatAdministratifUniteLegale:A`; // Entreprises actives uniquement

    // CORRECTION 1: Filtre de diffusion plus permissif pour inclure toutes les micro-entreprises
    // On ne filtre PAS par statutDiffusionUniteLegale pour récupérer le maximum d'entreprises

    // CORRECTION 2: Filtre géographique plus large - utiliser seulement le département
    const deptCode = baseCoords.postalCode.substring(0, 2);
    sireneQuery += ` AND (codePostalEtablissement:${deptCode}*`;

    // Ajouter aussi la recherche par commune
    if (baseCoords.cityName) {
      sireneQuery += ` OR libelleCommuneEtablissement:"${baseCoords.cityName}"`;
    }

    if (baseCoords.postalCode) {
      sireneQuery += ` OR codePostalEtablissement:${baseCoords.postalCode}`;
    }

    sireneQuery += ")"; // Fermer la parenthèse ouverte

    // Filtre par secteur d'activité
    if (sector && sector !== "all") {
      const sectors = {
        restaurants: "56*",
        commerce: "47*",
        artisans: "43*",
        services: "62*",
        sante: "86*",
      };
      const nafCode = sectors[sector as keyof typeof sectors];
      if (nafCode) {
        sireneQuery += ` AND activitePrincipaleUniteLegale:${nafCode}`;
      }
    }

    // Filtre par taille d'entreprise - CORRIGÉ pour inclure les entreprises sans catégorie
    if (companySize && companySize !== "all") {
      if (companySize === "micro") {
        // Les micro-entreprises peuvent avoir PME OU pas de catégorie (null)
        // On ne filtre PAS pour inclure toutes les petites structures
        // sireneQuery += ` AND (categorieEntreprise:PME OR NOT categorieEntreprise:*)`;
        // Pour l'instant, on ne filtre pas pour récupérer toutes les micro-entreprises
      } else if (companySize === "tpe") {
        sireneQuery += ` AND categorieEntreprise:TPE`;
      } else if (companySize === "pme") {
        sireneQuery += ` AND categorieEntreprise:PME`;
      }
    }

    // Filtre par date de création
    if (createdSince && createdSince !== "all") {
      const dates = {
        "1month": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        "3months": new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        "6months": new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        "1year": new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      };
      const fromDate = dates[createdSince as keyof typeof dates];
      if (fromDate) {
        sireneQuery += ` AND dateCreationUniteLegale:[${
          fromDate.toISOString().split("T")[0]
        } TO *]`;
      }
    }

    // 1000 = maximum accepté par l'API Sirene sur un seul appel
    const sireneUrl = `https://api.insee.fr/api-sirene/3.11/siret?q=${encodeURIComponent(
      sireneQuery
    )}&nombre=1000`;

    let sireneData: SireneResponse;

    // Vérifier si on a la clé API
    if (process.env.SIRENE_API_KEY) {
      try {
        const sireneResponse = await fetch(sireneUrl, {
          headers: {
            Accept: "application/json",
            "X-INSEE-Api-Key-Integration": process.env.SIRENE_API_KEY,
          },
        });

        if (!sireneResponse.ok) {
          const errorText = await sireneResponse.text();
          throw new Error(
            `Erreur API Sirene: ${sireneResponse.status} - ${errorText}`
          );
        }

        sireneData = await sireneResponse.json();
      } catch (error) {
        console.error("Erreur API Sirene:", error);
        return NextResponse.json(
          {
            error: "L'API Sirene est injoignable",
            details: error instanceof Error ? error.message : "Erreur inconnue",
          },
          { status: 502 }
        );
      }
    } else {
      // Mieux vaut une erreur explicite que des résultats fictifs qui
      // laisseraient croire que la recherche a fonctionné.
      return NextResponse.json(
        { error: "Clé API Sirene manquante (SIRENE_API_KEY non configurée)" },
        { status: 503 }
      );
    }

    // CORRECTION 3: Traitement des résultats avec calcul de distance GPS précis
    const results = [];
    const radiusKm = parseInt(radius);

    if (!sireneData.etablissements || sireneData.etablissements.length === 0) {
      return NextResponse.json({
        success: true,
        total: 0,
        totalAvailable: sireneData.header?.total || 0,
        baseCoords,
        results: [],
      });
    }

    {
      // Traitement des vraies données API
      for (const etablissement of sireneData.etablissements) {
        let distance = 0;

        // CORRECTION 4: Calcul de distance GPS précis si coordonnées Lambert disponibles
        const lambertX = parseFloat(
          etablissement.adresseEtablissement
            .coordonneeLambertAbscisseEtablissement
        );
        const lambertY = parseFloat(
          etablissement.adresseEtablissement
            .coordonneeLambertOrdonneeEtablissement
        );

        // Distance exacte si l'INSEE fournit les coordonnées, sinon estimée
        // depuis le centre de la commune — jamais inventée : le drapeau
        // distanceApprox permet de l'afficher honnêtement côté interface.
        let distanceApprox = false;

        if (lambertX && lambertY && lambertX > 0 && lambertY > 0) {
          const coords = lambertToGPS(lambertX, lambertY);
          distance = calculateDistance(
            baseCoords.lat,
            baseCoords.lon,
            coords.lat,
            coords.lon
          );
        } else {
          distanceApprox = true;
          const etablissementPostalCode =
            etablissement.adresseEtablissement.codePostalEtablissement || "";
          const sameCity =
            etablissement.adresseEtablissement.libelleCommuneEtablissement?.toUpperCase() ===
            baseCoords.cityName;

          if (sameCity || etablissementPostalCode === baseCoords.postalCode) {
            distance = 0;
          } else if (
            etablissementPostalCode.substring(0, 2) ===
            baseCoords.postalCode.substring(0, 2)
          ) {
            // Même département : on ne sait pas où exactement, on garde
            // l'établissement mais sans prétendre connaître la distance.
            distance = Math.min(radiusKm, 30);
          } else {
            distance = radiusKm + 10; // Hors département : exclu par le filtre
          }
        }

        if (distance <= radiusKm) {
          // Construction du nom pour les personnes physiques vs morales
          let companyName = etablissement.uniteLegale.denominationUniteLegale;
          if (
            !companyName &&
            etablissement.uniteLegale.prenom1UniteLegale &&
            etablissement.uniteLegale.nomUniteLegale
          ) {
            // Personne physique : Prénom + Nom
            companyName = `${etablissement.uniteLegale.prenom1UniteLegale} ${etablissement.uniteLegale.nomUniteLegale}`;
          }
          if (!companyName) {
            companyName = "Nom non renseigné";
          }

          results.push({
            siren: etablissement.siren,
            siret: etablissement.siret,
            name: companyName,
            address: `${
              etablissement.adresseEtablissement.numeroVoieEtablissement || ""
            } ${
              etablissement.adresseEtablissement.typeVoieEtablissement || ""
            } ${
              etablissement.adresseEtablissement.libelleVoieEtablissement || ""
            }`.trim(),
            city: etablissement.adresseEtablissement
              .libelleCommuneEtablissement,
            postalCode:
              etablissement.adresseEtablissement.codePostalEtablissement,
            activity: etablissement.uniteLegale.activitePrincipaleUniteLegale,
            creationDate: etablissement.uniteLegale.dateCreationUniteLegale,
            status:
              etablissement.uniteLegale.etatAdministratifUniteLegale === "A"
                ? "Active"
                : "Inactive",
            distance: Math.round(distance * 10) / 10,
            distanceApprox,
          });
        }
      }
    }

    // Tri par distance
    results.sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      total: results.length,
      totalAvailable: sireneData.header?.total || 0,
      baseCoords,
      results,
    });
  } catch (error) {
    console.error("Erreur API prospection:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Erreur lors de la recherche", details: errorMessage },
      { status: 500 }
    );
  }
}
