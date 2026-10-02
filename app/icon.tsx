import { ImageResponse } from "next/og";

export const contentType = "image/png";

// 32 = favicon d'onglet, 192/512 = manifest PWA.
const SIZES = [32, 192, 512] as const;

export function generateImageMetadata() {
  return SIZES.map((size) => ({
    id: String(size),
    size: { width: size, height: size },
    contentType: "image/png",
  }));
}

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

// Next.js 16 fournit `id` sous forme de Promise.
export default async function Icon({ id }: { id: Promise<string> }) {
  const dimension = Number(await id) || 192;

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
        <Mark size={dimension * 0.68} />
      </div>
    ),
    { width: dimension, height: dimension }
  );
}
