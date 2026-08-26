import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/require-admin";

// Devine les domaines probables d'une entreprise et teste s'ils répondent.
// Volontairement conservateur : on ne conclut "a un site" que si un domaine
// répond vraiment, sinon on renvoie "inconnu" plutôt qu'un faux négatif.
function candidateDomains(name: string): string[] {
  const clean = name
    .toLowerCase()
    .normalize("NFD") // décompose les accents, retirés juste après avec [^a-z0-9]
    .replace(/\b(sarl|sas|sasu|eurl|sci|earl|snc|ei|entreprise|societe)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 30);

  if (clean.length < 3) return [];
  return [`${clean}.fr`, `${clean}.com`];
}

async function domainResponds(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}`, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(4000),
    });
    return res.status < 400;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return unauthorizedResponse();

  const { companies } = (await request.json().catch(() => ({}))) as {
    companies?: { siren: string; name: string }[];
  };
  if (!Array.isArray(companies) || companies.length === 0) {
    return NextResponse.json({ error: "Aucune entreprise fournie" }, { status: 400 });
  }

  // Borne dure : chaque entreprise = jusqu'à 2 requêtes réseau externes.
  const batch = companies.slice(0, 60);

  const results = await Promise.all(
    batch.map(async (company) => {
      const domains = candidateDomains(company.name);
      for (const domain of domains) {
        if (await domainResponds(domain)) {
          return { siren: company.siren, website: `https://${domain}` };
        }
      }
      return { siren: company.siren, website: null };
    })
  );

  return NextResponse.json({ results });
}
