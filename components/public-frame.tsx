import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "./logo";

// Cadre des pages reçues par lien (avis, brief, statut) : logo en haut,
// contenu centré, signature en bas. Toujours en clair, comme l'accueil.
export function PublicFrame({
  children,
  width = "max-w-[640px]",
}: {
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className="landing flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-5 py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-[family-name:var(--font-bricolage)] font-bold tracking-tight"
        >
          <LogoMark className="size-8" />
          Gaël Richard
        </Link>
        <span className="hidden text-sm text-muted-foreground sm:block">développeur freelance</span>
      </div>
      <main className={`mx-auto w-full flex-1 px-5 py-10 md:py-16 ${width}`}>{children}</main>
      <p className="mx-auto w-full max-w-[1120px] px-5 py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Gaël Richard · gael-dev.fr
      </p>
    </div>
  );
}

// Message plein écran : lien expiré, avis envoyé, etc.
export function PublicNotice({
  kicker,
  title,
  text,
  action,
}: {
  kicker: string;
  title: ReactNode;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="pt-6 md:pt-14">
      <span className="note note-comment">{kicker}</span>
      <h1 className="mt-5 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.08]">{title}</h1>
      <p className="mt-5 max-w-[48ch] text-lg text-muted-foreground">{text}</p>
      {action && <div className="mt-8 flex flex-wrap gap-3">{action}</div>}
    </div>
  );
}
