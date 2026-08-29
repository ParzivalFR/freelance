/**
 * Composition des visuels réseaux sociaux, dessinée au canvas côté client.
 *
 * La capture reste sur le poste : ni téléversement, ni stockage, et l'aperçu se
 * redessine à chaque frappe.
 *
 * La règle qui tient tout : **on décore derrière la capture, jamais par-dessus**.
 * Dégradé, halo, trame de points, ombre portée — tout se pose en arrière-plan.
 * Rien ne vient traverser l'écran affiché, parce que c'est exactement ce qui
 * délavait les captures claires dans les mockups d'origine. La capture est
 * posée à plat, sans rotation 3D : en vignette, un écran incliné n'est plus
 * lisible.
 */

export const BRAND_PURPLE = "#7158ff";
export const BRAND_DARK = "#0A0A0F";

export type FormatId = "post" | "story" | "carre";
export type BackgroundId = "violet" | "sombre" | "creme";
export type FrameId = "aucun" | "navigateur";
export type LayoutId = "titre-haut" | "titre-bas";

/**
 * Depuis janvier 2025, la grille de profil Instagram recadre en 3:4. Le 4:5
 * reste le format qui occupe le plus de hauteur dans le fil tout en survivant
 * le mieux à ce recadrage.
 */
export const FORMATS: Record<
  FormatId,
  { label: string; hint: string; width: number; height: number }
> = {
  post: { label: "Post", hint: "4:5 · le fil", width: 1080, height: 1350 },
  story: { label: "Story", hint: "9:16 · plein écran", width: 1080, height: 1920 },
  carre: { label: "Carré", hint: "1:1 · polyvalent", width: 1080, height: 1080 },
};

interface Theme {
  label: string;
  from: string;
  to: string;
  /** Halo posé derrière la capture pour la décoller du fond. */
  glow: string;
  /** Trame de points décorative, très discrète. */
  dots: string;
  text: string;
  muted: string;
  accent: string;
  /** Liseré clair sur le bord de la capture : donne l'épaisseur d'un vrai écran. */
  edge: string;
  pillBg: string;
  pillText: string;
  browserDark: boolean;
}

export const BACKGROUNDS: Record<BackgroundId, Theme> = {
  violet: {
    label: "Violet",
    from: "#8B74FF",
    to: "#4B32D6",
    glow: "rgba(255,255,255,0.30)",
    dots: "rgba(255,255,255,0.14)",
    text: "#FFFFFF",
    muted: "rgba(255,255,255,0.75)",
    accent: "#FFFFFF",
    edge: "rgba(255,255,255,0.55)",
    pillBg: "rgba(255,255,255,0.16)",
    pillText: "#FFFFFF",
    browserDark: true,
  },
  sombre: {
    label: "Sombre",
    from: "#16121F",
    to: BRAND_DARK,
    glow: "rgba(113,88,255,0.50)",
    dots: "rgba(255,255,255,0.09)",
    text: "#F4F4F6",
    muted: "rgba(244,244,246,0.62)",
    accent: BRAND_PURPLE,
    edge: "rgba(255,255,255,0.16)",
    pillBg: "rgba(113,88,255,0.22)",
    pillText: "#C7B8FF",
    browserDark: true,
  },
  creme: {
    label: "Crème",
    from: "#FBF9F5",
    to: "#E7E1D6",
    glow: "rgba(113,88,255,0.20)",
    dots: "rgba(10,10,15,0.09)",
    text: "#0A0A0F",
    muted: "rgba(10,10,15,0.58)",
    accent: BRAND_PURPLE,
    edge: "rgba(10,10,15,0.10)",
    pillBg: "rgba(113,88,255,0.14)",
    pillText: "#4B32D6",
    browserDark: false,
  },
};

export interface RenderOptions {
  image: HTMLImageElement | null;
  format: FormatId;
  title: string;
  subtitle: string;
  /** Petit texte en pastille au-dessus du titre. Optionnel. */
  badge: string;
  /** Annotation manuscrite, la touche de la charte. Optionnel. */
  note: string;
  background: BackgroundId;
  frame: FrameId;
  layout: LayoutId;
  /** Familles résolues depuis le DOM : next/font génère des noms uniques. */
  displayFont: string;
  bodyFont: string;
  handFont: string;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

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

function drawBrowserBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  barHeight: number,
  dark: boolean
) {
  ctx.fillStyle = dark ? "#1C1C22" : "#E9E5DD";
  ctx.fillRect(x, y, w, barHeight);

  const dotRadius = barHeight * 0.125;
  ["#FF5F57", "#FEBC2E", "#28C840"].forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(x + barHeight * 0.6 + i * dotRadius * 3.4, y + barHeight / 2, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  const pillW = w * 0.40;
  const pillH = barHeight * 0.52;
  roundedRectPath(ctx, x + (w - pillW) / 2, y + (barHeight - pillH) / 2, pillW, pillH, pillH / 2);
  ctx.fillStyle = dark ? "#2B2B34" : "#F7F5F1";
  ctx.fill();
}

/** Trame de points régulière : donne de la matière au fond sans bruit visuel. */
function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  const step = 46;
  const radius = 2.4;
  ctx.fillStyle = color;
  for (let y = step; y < h; y += step) {
    for (let x = step; x < w; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Pastille arrondie (badge) ; renvoie sa hauteur pour chaîner la mise en page. */
function drawPill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  baseline: number,
  font: string,
  bg: string,
  fg: string
): number {
  ctx.font = font;
  const paddingX = 26;
  const height = 52;
  const width = ctx.measureText(text).width + paddingX * 2;
  roundedRectPath(ctx, x, baseline - height + 14, width, height, height / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.fillText(text, x + paddingX, baseline - 2);
  return height;
}

export function renderSocialCard(canvas: HTMLCanvasElement, options: RenderOptions) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const {
    image, format, title, subtitle, badge, note,
    background, frame, layout, displayFont, bodyFont, handFont,
  } = options;

  const theme = BACKGROUNDS[background];
  const { width: W, height: H } = FORMATS[format];
  const titleAtTop = layout === "titre-haut";

  canvas.width = W;
  canvas.height = H;

  // Échelle : une story est plus haute, tout doit grandir avec elle.
  const scale = H / 1350;
  const margin = Math.round(88 * Math.min(1.15, scale + 0.1));
  const contentWidth = W - margin * 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // ── Fond : dégradé + halo + trame ──────────────────────────────────────────
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, theme.from);
  gradient.addColorStop(1, theme.to);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  drawDotGrid(ctx, W, H, theme.dots);

  const glowRadius = W * 0.78;
  const glow = ctx.createRadialGradient(W / 2, H * 0.48, 0, W / 2, H * 0.48, glowRadius);
  glow.addColorStop(0, theme.glow);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── Bloc texte ─────────────────────────────────────────────────────────────
  const titleSize = Math.round(78 * Math.min(1.25, scale + 0.05));
  const titleLineHeight = Math.round(titleSize * 1.08);
  const badgeFont = `400 ${Math.round(25 * scale + 6)}px ${bodyFont}`;
  const hasBadge = badge.trim().length > 0;
  const badgeHeight = hasBadge ? 74 : 0;

  ctx.font = `400 ${titleSize}px ${displayFont}`;
  const titleLines = wrapText(ctx, (title || "").toUpperCase(), contentWidth).slice(0, 3);
  const titleBlockHeight = titleLines.length * titleLineHeight;

  const subtitleSize = Math.round(30 * Math.min(1.2, scale + 0.05));
  const hasSubtitle = subtitle.trim().length > 0;
  const subtitleHeight = hasSubtitle ? subtitleSize + 22 : 0;

  const textBlockHeight = badgeHeight + titleBlockHeight + subtitleHeight;
  const signatureHeight = Math.round(78 * Math.min(1.2, scale + 0.05));

  const textTop = titleAtTop
    ? margin + badgeHeight + titleSize
    : H - margin - signatureHeight - titleBlockHeight - subtitleHeight + titleSize * 0.8;

  if (hasBadge) {
    drawPill(ctx, badge.trim().toUpperCase(), margin, textTop - titleSize - 16, badgeFont, theme.pillBg, theme.pillText);
  }

  ctx.font = `400 ${titleSize}px ${displayFont}`;
  ctx.fillStyle = theme.text;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, margin, textTop + i * titleLineHeight);
  });

  if (hasSubtitle) {
    ctx.font = `400 ${subtitleSize}px ${bodyFont}`;
    ctx.fillStyle = theme.muted;
    ctx.fillText(subtitle, margin, textTop + titleBlockHeight + 6);
  }

  // ── Capture ────────────────────────────────────────────────────────────────
  const noteSize = Math.round(38 * Math.min(1.25, scale + 0.05));
  const noteSpace = note.trim() ? noteSize + 26 : 0;

  if (image && image.naturalWidth > 0) {
    const gap = Math.round(76 * Math.min(1.2, scale + 0.05));
    const zoneTop = titleAtTop ? margin + textBlockHeight + gap : margin + gap * 0.4;
    const zoneBottom = titleAtTop
      ? H - margin - signatureHeight - noteSpace
      : textTop - titleSize - gap - noteSpace;
    const zoneHeight = Math.max(160, zoneBottom - zoneTop);

    const barHeight = frame === "navigateur" ? Math.round(56 * Math.min(1.2, scale + 0.05)) : 0;
    const ratio = image.naturalHeight / image.naturalWidth;

    let drawWidth = contentWidth;
    let drawHeight = drawWidth * ratio + barHeight;
    if (drawHeight > zoneHeight) {
      drawHeight = zoneHeight;
      drawWidth = (drawHeight - barHeight) / ratio;
    }

    const drawX = (W - drawWidth) / 2;
    const drawY = zoneTop + (zoneHeight - drawHeight) / 2;
    const radius = 30;

    // Ombre portée généreuse : c'est elle qui décolle la capture du fond.
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.42)";
    ctx.shadowBlur = 90;
    ctx.shadowOffsetY = 34;
    roundedRectPath(ctx, drawX, drawY, drawWidth, drawHeight, radius);
    ctx.fillStyle = theme.browserDark ? "#101015" : "#FFFFFF";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundedRectPath(ctx, drawX, drawY, drawWidth, drawHeight, radius);
    ctx.clip();
    if (barHeight > 0) {
      drawBrowserBar(ctx, drawX, drawY, drawWidth, barHeight, theme.browserDark);
    }
    ctx.drawImage(image, drawX, drawY + barHeight, drawWidth, drawHeight - barHeight);
    ctx.restore();

    // Liseré : simule l'épaisseur du verre, sans rien poser sur le contenu.
    ctx.save();
    roundedRectPath(ctx, drawX + 0.75, drawY + 0.75, drawWidth - 1.5, drawHeight - 1.5, radius);
    ctx.strokeStyle = theme.edge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Annotation manuscrite, posée sous la capture.
    if (note.trim()) {
      ctx.font = `400 ${noteSize}px ${handFont}`;
      ctx.fillStyle = theme.accent;
      ctx.textAlign = "center";
      ctx.fillText(note.trim(), W / 2, Math.min(drawY + drawHeight + noteSize + 18, H - margin - signatureHeight - 12));
      ctx.textAlign = "left";
    }
  }

  // ── Signature ──────────────────────────────────────────────────────────────
  const markSize = Math.round(44 * Math.min(1.2, scale + 0.05));
  const markY = H - margin + markSize * 0.15;

  ctx.font = `400 ${markSize}px ${displayFont}`;
  ctx.fillStyle = theme.text;
  ctx.fillText("GR", margin, markY);
  const grWidth = ctx.measureText("GR").width;
  ctx.fillStyle = theme.accent;
  ctx.fillText(".", margin + grWidth, markY);

  ctx.font = `400 ${Math.round(27 * Math.min(1.2, scale + 0.05))}px ${bodyFont}`;
  ctx.fillStyle = theme.muted;
  ctx.textAlign = "right";
  ctx.fillText("gael-dev.fr", W - margin, markY - 4);
  ctx.textAlign = "left";
}
