import { ImageResponse } from "next/og";
import { loadDisplayFont } from "@/lib/og-font";

// Même marque que la navbar : "GR" + point violet, dans la police display.
// 32 = favicon d'onglet, 192/512 = manifest PWA. Tout est généré en PNG plutôt
// qu'en SVG, car un favicon SVG n'a pas accès aux polices du site et
// retomberait sur une graisse système différente.
export const contentType = "image/png";

const SIZES = [32, 192, 512] as const;

export function generateImageMetadata() {
  return SIZES.map((size) => ({
    id: String(size),
    size: { width: size, height: size },
    contentType: "image/png",
  }));
}

// Next.js 16 fournit `id` sous forme de Promise.
export default async function Icon({ id }: { id: Promise<string> }) {
  const dimension = Number(await id) || 192;
  const font = await loadDisplayFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0F",
          color: "#F4F4F6",
          fontFamily: font ? "Black Han Sans" : "sans-serif",
          fontSize: dimension * 0.42,
          fontWeight: 900,
          letterSpacing: -(dimension * 0.02),
        }}
      >
        GR<span style={{ color: "#7158ff" }}>.</span>
      </div>
    ),
    {
      width: dimension,
      height: dimension,
      ...(font
        ? { fonts: [{ name: "Black Han Sans", data: font, style: "normal" as const, weight: 400 as const }] }
        : {}),
    }
  );
}
