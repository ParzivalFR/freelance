import type { ReactNode } from "react";

export type LegalSection = { title: string; body: ReactNode };

// Gabarit des pages légales : titre, résumé, puis sections numérotées avec un
// sommaire collé à gauche sur grand écran.
export function LegalPage({
  kicker,
  title,
  intro,
  updated,
  sections,
}: {
  kicker: string;
  title: ReactNode;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-[1120px] px-5 pb-20 pt-12 md:pt-20">
      <span className="note note-comment">{kicker}</span>
      <h1 className="mt-5 text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-[1.08]">{title}</h1>
      <p className="mt-5 max-w-[60ch] text-lg text-muted-foreground">{intro}</p>
      <p className="mt-3 text-sm text-muted-foreground">Dernière mise à jour : {updated}</p>

      <div className="mt-12 grid gap-10 md:grid-cols-[220px_1fr] md:gap-16">
        <nav aria-label="Sommaire" className="hidden md:block">
          <ol className="sticky top-24 flex flex-col gap-2 text-sm text-muted-foreground">
            {sections.map((s, i) => (
              <li key={s.title}>
                <a href={`#s${i + 1}`} className="flex gap-3 transition-colors hover:text-foreground">
                  <span className="font-[family-name:var(--font-jetbrains)] text-accent-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-[68ch]">
          {sections.map((s, i) => (
            <section key={s.title} id={`s${i + 1}`} className="scroll-mt-24 border-t py-8 first:border-t-0 first:pt-0">
              <h2 className="flex items-baseline gap-3 text-2xl font-bold">
                <span className="font-[family-name:var(--font-jetbrains)] text-base font-normal text-accent-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </h2>
              <div className="mt-4 space-y-3 text-foreground/85 [&_a]:underline [&_a]:underline-offset-2 [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[.7em] [&_li]:before:h-0.5 [&_li]:before:w-2.5 [&_li]:before:bg-accent-foreground [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:space-y-2">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
