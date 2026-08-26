// Récupère Black Han Sans (police --font-display du site) pour que les icônes
// générées via ImageResponse aient le même rendu que le logo de la navbar.
// Renvoie null si Google Fonts est injoignable : l'appelant retombe alors sur
// une graisse système plutôt que de faire échouer le build.
const cache = new Map<string, ArrayBuffer | null>();

// Satori ne lit que TTF/OTF/WOFF. Google Fonts choisit le format selon le
// User-Agent : ce Safari 5 déclenche du WOFF (un UA moderne donnerait du
// WOFF2, un UA IE de l'EOT — deux formats non supportés).
const WOFF_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2";

/**
 * @param text caractères réellement dessinés — Google renvoie un sous-ensemble
 * de la police limité à ceux-ci (~1 Ko au lieu de ~1 Mo).
 */
export async function loadDisplayFont(text = "GR."): Promise<ArrayBuffer | null> {
  const cached = cache.get(text);
  if (cached !== undefined) return cached;

  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Black+Han+Sans&text=${encodeURIComponent(text)}&display=swap`,
      { headers: { "User-Agent": WOFF_USER_AGENT } }
    );
    if (!cssRes.ok) throw new Error(`CSS ${cssRes.status}`);

    const css = await cssRes.text();
    const url = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1];
    if (!url) throw new Error("URL de police introuvable");

    const fontRes = await fetch(url, { headers: { "User-Agent": WOFF_USER_AGENT } });
    if (!fontRes.ok) throw new Error(`Police ${fontRes.status}`);

    const data = await fontRes.arrayBuffer();
    cache.set(text, data);
    return data;
  } catch {
    cache.set(text, null);
    return null;
  }
}
