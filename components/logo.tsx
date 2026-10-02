// Signe de la marque : un G en cadre, avec un petit « r » logé dedans.
// Le G prend la couleur du texte, le r la couleur passée en `accent`.
export function LogoMark({
  className,
  accent = "#4a5a3a",
}: {
  className?: string;
  accent?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden className={className}>
      <path
        d="M82 22 H36 Q20 22 20 38 V62 Q20 78 36 78 H82 V52 H70"
        stroke="currentColor"
        strokeWidth="13"
      />
      <path d="M42.5 66 V41 H58" stroke={accent} strokeWidth="10" />
    </svg>
  );
}
