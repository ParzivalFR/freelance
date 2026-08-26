import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Petite accroche manuscrite violette au-dessus du titre. */
  eyebrow: string;
  /** Début du titre, rendu dans la couleur du texte. */
  title: string;
  /** Fin du titre, mise en violet — comme sur la landing. */
  titleAccent?: string;
  description?: ReactNode;
  /** Boutons alignés à droite du titre sur grand écran. */
  actions?: ReactNode;
}

/**
 * En-tête commun aux pages d'admin : reprend la typographie de la landing
 * (accroche manuscrite + titre display en capitales coupé par un accent violet).
 */
export function PageHeader({
  eyebrow,
  title,
  titleAccent,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] uppercase leading-none text-foreground">
          {title}
          {titleAccent && <span className="text-[#7158ff]">{titleAccent}</span>}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Sous-titre de section, dans la même écriture manuscrite que l'accroche. */
export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff] ${className}`}
    >
      {children}
    </p>
  );
}
