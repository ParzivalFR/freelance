/**
 * Plausible Analytics API Client
 * Documentation: https://plausible.io/docs/stats-api
 */

interface PlausibleStats {
  visitors: { value: number };
  pageviews: { value: number };
  bounce_rate: { value: number };
  visit_duration: { value: number };
}

interface PlausibleResponse {
  results: {
    visitors: { value: number };
    pageviews: { value: number };
    bounce_rate: { value: number };
    visit_duration: { value: number };
  };
}

const PLAUSIBLE_API_URL = "https://plausible.gael-dev.fr/api/v1";
const PLAUSIBLE_SITE_ID = "freelance.gael-dev.fr";

/**
 * Récupère les statistiques depuis Plausible
 * @param period - Période de temps (ex: "30d", "7d", "day", "month")
 * @param metrics - Métriques à récupérer
 */
export async function getPlausibleStats(
  period: string = "30d",
  metrics: string[] = ["visitors", "pageviews", "bounce_rate", "visit_duration"]
): Promise<PlausibleStats | null> {
  const apiKey = process.env.PLAUSIBLE_API_KEY;

  if (!apiKey) {
    console.error("PLAUSIBLE_API_KEY is not set");
    return null;
  }

  try {
    const metricsParam = metrics.join(",");
    const url = `${PLAUSIBLE_API_URL}/stats/aggregate?site_id=${PLAUSIBLE_SITE_ID}&period=${period}&metrics=${metricsParam}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    });

    if (!response.ok) {
      console.error(`Plausible API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: PlausibleResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching Plausible stats:", error);
    return null;
  }
}

/**
 * Récupère les statistiques comparées (période actuelle vs période précédente)
 */
export async function getPlausibleComparison(period: string = "30d") {
  const apiKey = process.env.PLAUSIBLE_API_KEY;

  if (!apiKey) {
    console.error("PLAUSIBLE_API_KEY is not set");
    return null;
  }

  try {
    const metrics = "visitors,pageviews,bounce_rate,visit_duration";
    const url = `${PLAUSIBLE_API_URL}/stats/aggregate?site_id=${PLAUSIBLE_SITE_ID}&period=${period}&metrics=${metrics}&compare=previous_period`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    });

    if (!response.ok) {
      console.error(`Plausible API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching Plausible comparison:", error);
    return null;
  }
}

/**
 * Formate la durée de visite en format lisible (ex: "3m 24s")
 */
export function formatVisitDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Formate le nombre avec des séparateurs de milliers
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("fr-FR");
}

/**
 * Calcule le pourcentage de changement
 */
export function calculateChangePercent(current: number, previous: number): string {
  if (previous === 0) return "+100%";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}
