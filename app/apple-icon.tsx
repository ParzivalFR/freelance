import { ImageResponse } from "next/og";

// iOS ignore les favicons SVG : on génère un vrai PNG pour l'écran d'accueil.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#7158ff",
          color: "#ffffff",
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: -6,
        }}
      >
        GR
      </div>
    ),
    size
  );
}
