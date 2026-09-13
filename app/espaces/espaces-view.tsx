import Link from "next/link";
import { ArrowRight, Bot, LayoutDashboard } from "lucide-react";

/** Affichage de l'aiguillage, séparé du contrôle d'accès qui vit dans page.tsx. */
export function EspacesView({ prenom }: { prenom: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-3xl">
        <p className="font-[family-name:var(--font-handwriting)] text-3xl text-[#7158ff]">
          Bonjour {prenom}
        </p>
        {/* Pas de capitale accentuée dans la police d'affichage. */}
        <h1 className="mt-2 pt-[0.14em] font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,3rem)] uppercase leading-[1.25] text-foreground">
          On commence <span className="text-[#7158ff]">par quoi ?</span>
        </h1>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <EspaceCard
            href="/admin"
            icon={<LayoutDashboard className="size-5" />}
            titre="Administration"
            texte="Prospection, clients, devis, briefs, bots et statistiques."
          />
          <EspaceCard
            href="/dashboard/bot"
            icon={<Bot className="size-5" />}
            titre="Espace client"
            texte="Tes bots Discord, vus comme tes clients les voient."
          />
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Tu peux changer d&apos;espace à tout moment depuis ton menu, en haut à
          droite.
        </p>
      </div>
    </div>
  );
}

function EspaceCard({
  href,
  icon,
  titre,
  texte,
}: {
  href: string;
  icon: React.ReactNode;
  titre: string;
  texte: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border-2 bg-card p-6 transition-colors hover:border-[#7158ff] hover:bg-[#7158ff]/5"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-[#7158ff]/10 text-[#7158ff]">
        {icon}
      </div>
      <p className="mt-4 text-lg font-semibold text-foreground">{titre}</p>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
        {texte}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#7158ff]">
        Y aller
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
