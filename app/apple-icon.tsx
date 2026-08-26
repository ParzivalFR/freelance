import { ImageResponse } from "next/og";
import { loadDisplayFont } from "@/lib/og-font";

// iOS ignore les favicons SVG : on génère un vrai PNG pour l'écran d'accueil.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
          fontSize: 76,
          fontWeight: 900,
          letterSpacing: -4,
        }}
      >
        GR<span style={{ color: "#7158ff" }}>.</span>
      </div>
    ),
    {
      ...size,
      ...(font
        ? { fonts: [{ name: "Black Han Sans", data: font, style: "normal" as const, weight: 400 as const }] }
        : {}),
    }
  );
}
