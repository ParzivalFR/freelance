import { requireAdmin, unauthorizedResponse } from "@/lib/require-admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * Sirene ne publie aucune coordonnée de contact : l'INSEE ne les collecte pas.
 * On complète donc avec OpenStreetMap, qui porte les tags `phone`, `website`
 * et `email` des commerces cartographiés. C'est libre, sans clé d'API, et la
 * couverture est bonne sur le commerce de proximité — précisément la cible.
 *
 * Une seule requête Overpass couvre toute la zone de recherche : interroger
 * l'API entreprise par entreprise se ferait limiter en quelques secondes.
 */

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

interface OverpassElement {
  tags?: Record<string, string>;
}

/**
 * Ramène un nom d'enseigne à un noyau comparable : sans accents, sans forme
 * juridique, sans ponctuation. « SARL Boulangerie Martin » et
 * « Boulangerie Martin » doivent tomber sur la même clé.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // sépare les accents de leur lettre pour les retirer juste après
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\b(sarl|sas|sasu|eurl|sci|earl|snc|ei|eirl|scop|sa|societe|entreprise|ets|etablissements)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function pickTag(tags: Record<string, string>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = tags[key]?.trim();
    if (value) return value;
  }
  return null;
}

/** Normalise un numéro français en format lisible : +33 2 40 70 10 46. */
function formatPhone(raw: string): string {
  // Un tag OSM peut contenir plusieurs numéros séparés par ; ou ,
  const first = raw.split(/[;,]/)[0].trim();
  const digits = first.replace(/[^\d+]/g, "");

  const national = digits.startsWith("+33")
    ? "0" + digits.slice(3)
    : digits.startsWith("0033")
      ? "0" + digits.slice(4)
      : digits;

  if (/^0\d{9}$/.test(national)) {
    return national.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  }
  return first;
}

async function queryOverpass(query: string): Promise<OverpassElement[]> {
  let lastError: unknown = null;

  // Overpass renvoie souvent 429/504 quand l'instance publique est chargée :
  // on bascule sur le miroir plutôt que d'échouer.
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) {
        lastError = new Error(`Overpass ${res.status}`);
        continue;
      }
      const data = (await res.json()) as { elements?: OverpassElement[] };
      return data.elements ?? [];
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError ?? new Error("Overpass injoignable");
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return unauthorizedResponse();

  const { companies, center, radius } = (await request.json().catch(() => ({}))) as {
    companies?: { siren: string; name: string }[];
    center?: { lat: number; lon: number };
    radius?: number;
  };

  if (!Array.isArray(companies) || companies.length === 0) {
    return NextResponse.json({ error: "Aucune entreprise fournie" }, { status: 400 });
  }
  if (!center || typeof center.lat !== "number" || typeof center.lon !== "number") {
    return NextResponse.json(
      { error: "Coordonnées de recherche manquantes — relancez une recherche." },
      { status: 400 }
    );
  }

  // Overpass raisonne en mètres. Plafonné à 50 km : au-delà, la requête
  // dépasse le timeout de l'instance publique.
  const meters = Math.min(Math.max(Number(radius) || 25, 1), 50) * 1000;

  const query = `[out:json][timeout:25];
nwr(around:${meters},${center.lat},${center.lon})[name][~"^(phone|contact:phone|website|contact:website|email|contact:email)$"~"."];
out center tags;`;

  let elements: OverpassElement[];
  try {
    elements = await queryOverpass(query);
  } catch {
    return NextResponse.json(
      { error: "OpenStreetMap n'a pas répondu. Réessayez dans un instant." },
      { status: 502 }
    );
  }

  // Index des enseignes OSM par nom normalisé. En cas de doublon, la première
  // entrée gagne : les suivantes sont souvent des nœuds annexes (parking,
  // entrée de bâtiment) portant le même nom mais moins de tags.
  const byName = new Map<string, { phone: string | null; website: string | null; email: string | null }>();

  for (const element of elements) {
    const tags = element.tags;
    if (!tags?.name) continue;

    const key = normalizeName(tags.name);
    if (key.length < 3 || byName.has(key)) continue;

    const phone = pickTag(tags, "phone", "contact:phone", "contact:mobile");
    const website = pickTag(tags, "website", "contact:website", "contact:facebook");
    const email = pickTag(tags, "email", "contact:email");
    if (!phone && !website && !email) continue;

    byName.set(key, {
      phone: phone ? formatPhone(phone) : null,
      website: website ? (website.startsWith("http") ? website : `https://${website}`) : null,
      email,
    });
  }

  const results = companies.map((company) => {
    const key = normalizeName(company.name);
    let match = byName.get(key);

    // Repêchage : l'enseigne OSM contient souvent le nom légal, ou l'inverse
    // (« Le Narval » vs « Le Narval Restaurant »). On exige que le nom court
    // couvre au moins 75 % du long, sinon un mot de métier générique suffirait
    // à accrocher n'importe quoi — « Boulangerie Untel » tomberait sur
    // l'enseigne « Boulanger ». Un mauvais numéro coûte plus cher qu'un
    // numéro manquant : on préfère ne rien renvoyer.
    if (!match && key.length >= 6) {
      for (const [osmKey, value] of byName) {
        if (osmKey.length < 6) continue;
        if (!osmKey.includes(key) && !key.includes(osmKey)) continue;

        const ratio =
          Math.min(osmKey.length, key.length) / Math.max(osmKey.length, key.length);
        if (ratio >= 0.75) {
          match = value;
          break;
        }
      }
    }

    return {
      siren: company.siren,
      phone: match?.phone ?? null,
      email: match?.email ?? null,
      website: match?.website ?? null,
      found: Boolean(match),
    };
  });

  return NextResponse.json({
    results,
    poisScanned: byName.size,
  });
}
