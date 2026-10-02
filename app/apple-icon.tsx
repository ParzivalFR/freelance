import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Même signe que components/logo.tsx, sur fond encre. Généré en PNG : iOS et
// le manifest PWA ignorent les favicons SVG.
function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path
        d="M82 22 H36 Q20 22 20 38 V62 Q20 78 36 78 H82 V52 H70"
        stroke="#ffffff"
        strokeWidth="13"
      />
      <path d="M42.5 66 V41 H58" stroke="#dadfcf" strokeWidth="10" />
    </svg>
  );
}

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
          background: "#1e1f24",
        }}
      >
        <Mark size={122} />
      </div>
    ),
    size
  );
}
