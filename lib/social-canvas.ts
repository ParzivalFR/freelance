/**
 * Composition des visuels Instagram, dessinée au canvas.
 *
 * Tout se passe dans le navigateur : la capture reste sur le poste, il n'y a
 * ni téléversement ni stockage, et l'aperçu se redessine à chaque frappe.
 *
 * Le parti pris est l'inverse de shots.so : aucune rotation 3D, aucun reflet
 * par-dessus la capture, aucun fond texturé. Ces trois effets sont précisément
 * ce qui rendait les visuels illisibles en vignette et délavait les captures
 * claires. Ici la capture est posée à plat et reste le sujet.
 */

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1350; // 4:5, le format qui occupe le plus de hauteur dans le fil

export const BRAND_PURPLE = "#7158ff";
export const BRAND_DARK = "#0A0A0F";

export type BackgroundId = "violet" | "sombre" | "creme";
export type FrameId = "aucun" | "navigateur";
export type LayoutId = "titre-haut" | "titre-bas";

/** Les fonds sont volontairement unis : un dégradé complexe vole la vedette à la capture. */
export const BACKGROUNDS: Record<
  BackgroundId,
  { label: string; fill: string; text: string; muted: string; accent: string }
> = {
  violet: {
    label: "Violet",
    fill: BRAND_PURPLE,
    text: "#FFFFFF",
    muted: "rgba(255,255,255,0.72)",
    accent: "#FFFFFF",
  },
  sombre: {
    label: "Sombre",
    fill: BRAND_DARK,
    text: "#F4F4F6",
    muted: "rgba(244,244,246,0.6)",
    accent: BRAND_PURPLE,
  },
  creme: {
    label: "Crème",
    fill: "#F2EFE8",
    text: "#0A0A0F",
    muted: "rgba(10,10,15,0.55)",
    accent: BRAND_PURPLE,
  },
};

export interface RenderOptions {
  image: HTMLImageElement | null;
  title: string;
  subtitle: string;
  background: BackgroundId;
  frame: FrameId;
  layout: LayoutId;
  /** Familles résolues depuis le DOM : next/font génère des noms uniques. */
  displayFont: string;
  bodyFont: string;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Découpe le texte en lignes tenant dans `maxWidth`, au mot près. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = words[0];

  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}

/** Barre de navigateur factice : on comprend « c'est un site » sans lire une ligne. */
function drawBrowserBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  barHeight: number,
  dark: boolean
) {
  ctx.fillStyle = dark ? "#1C1C22" : "#E4E1DA";
  ctx.fillRect(x, y, w, barHeight);

  const dotColors = ["#FF5F57", "#FEBC2E", "#28C840"];
  const dotRadius = barHeight * 0.13;
  dotColors.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(x + barHeight * 0.55 + i * dotRadius * 3.2, y + barHeight / 2, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  const pillW = w * 0.42;
  const pillH = barHeight * 0.5;
  roundedRectPath(ctx, x + (w - pillW) / 2, y + (barHeight - pillH) / 2, pillW, pillH, pillH / 2);
  ctx.fillStyle = dark ? "#2A2A32" : "#F5F3EF";
  ctx.fill();
}

/**
 * Dessine le visuel complet. Fonction pure vis-à-vis du canvas : appelée à
 * chaque changement d'option pour rafraîchir l'aperçu.
 */
export function renderSocialCard(
  canvas: HTMLCanvasElement,
  options: RenderOptions
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { image, title, subtitle, background, frame, layout, displayFont, bodyFont } = options;
  const theme = BACKGROUNDS[background];
  const titleAtTop = layout === "titre-haut";

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx.fillStyle = theme.fill;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const margin = 80;
  const contentWidth = CANVAS_WIDTH - margin * 2;

  // ── Bloc texte ──────────────────────────────────────────────────────────────
  ctx.textBaseline = "alphabetic";
  ctx.font = `400 76px ${displayFont}`;
  const titleLines = wrapText(ctx, (title || "").toUpperCase(), contentWidth).slice(0, 3);
  const titleLineHeight = 84;
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const subtitleHeight = subtitle.trim() ? 46 : 0;
  const textBlockHeight = titleBlockHeight + subtitleHeight;

  const signatureHeight = 70;
  const textTop = titleAtTop
    ? margin + 76
    : CANVAS_HEIGHT - margin - signatureHeight - textBlockHeight + 46;

  ctx.fillStyle = theme.text;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, margin, textTop + i * titleLineHeight);
  });

  if (subtitle.trim()) {
    ctx.font = `400 30px ${bodyFont}`;
    ctx.fillStyle = theme.muted;
    ctx.fillText(subtitle, margin, textTop + titleBlockHeight + 8);
  }

  // ── Capture ─────────────────────────────────────────────────────────────────
  if (image && image.naturalWidth > 0) {
    const zoneTop = titleAtTop ? textTop + textBlockHeight + 70 : margin + 40;
    const zoneBottom = titleAtTop
      ? CANVAS_HEIGHT - margin - signatureHeight
      : textTop - titleLineHeight - 60;
    const zoneHeight = Math.max(200, zoneBottom - zoneTop);

    const barHeight = frame === "navigateur" ? 54 : 0;
    const ratio = image.naturalHeight / image.naturalWidth;

    // La capture s'inscrit dans la zone disponible sans jamais la déborder.
    let drawWidth = contentWidth;
    let drawHeight = drawWidth * ratio + barHeight;
    if (drawHeight > zoneHeight) {
      drawHeight = zoneHeight;
      drawWidth = (drawHeight - barHeight) / ratio;
    }

    const drawX = (CANVAS_WIDTH - drawWidth) / 2;
    const drawY = zoneTop + (zoneHeight - drawHeight) / 2;
    const radius = 26;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 18;
    roundedRectPath(ctx, drawX, drawY, drawWidth, drawHeight, radius);
    ctx.fillStyle = theme.fill;
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundedRectPath(ctx, drawX, drawY, drawWidth, drawHeight, radius);
    ctx.clip();
    if (barHeight > 0) {
      drawBrowserBar(ctx, drawX, drawY, drawWidth, barHeight, background !== "creme");
    }
    ctx.drawImage(image, drawX, drawY + barHeight, drawWidth, drawHeight - barHeight);
    ctx.restore();
  }

  // ── Signature ───────────────────────────────────────────────────────────────
  ctx.font = `400 40px ${displayFont}`;
  ctx.fillStyle = theme.text;
  const markY = CANVAS_HEIGHT - margin + 4;
  ctx.fillText("GR", margin, markY);
  const grWidth = ctx.measureText("GR").width;
  ctx.fillStyle = theme.accent;
  ctx.fillText(".", margin + grWidth, markY);

  ctx.font = `400 26px ${bodyFont}`;
  ctx.fillStyle = theme.muted;
  ctx.textAlign = "right";
  ctx.fillText("gael-dev.fr", CANVAS_WIDTH - margin, markY - 4);
  ctx.textAlign = "left";
}
