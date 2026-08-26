import { ImageResponse } from "next/og";

// Icônes PNG pour le manifest PWA (Android/Chrome n'acceptent pas toujours le
// SVG). Le favicon des navigateurs desktop reste app/icon.svg, plus net.
export const contentType = "image/png";

export function generateImageMetadata() {
  return [
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" },
  ];
}

export default function Icon({ id }: { id: string }) {
  const dimension = id === "512" ? 512 : 192;

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
          fontSize: dimension * 0.52,
          fontWeight: 900,
          letterSpacing: -(dimension * 0.035),
        }}
      >
        GR
      </div>
    ),
    { width: dimension, height: dimension }
  );
}
