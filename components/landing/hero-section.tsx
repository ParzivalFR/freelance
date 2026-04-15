"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: delay * 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const tags = ["Next.js", "Tailwind CSS", "TypeScript", "Electron", "Expo", "Supabase"];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[calc(100dvh-3.5rem)] overflow-hidden bg-background lg:min-h-[calc(100dvh-4rem)]"
    >
      {/* Glow d'ambiance subtil */}
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[#7158ff]/8 blur-[120px]" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start px-6 pt-10 pb-24 md:px-10 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-2 lg:items-center lg:py-16">

        {/* ── Colonne gauche ────────────────────────── */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Badge disponibilité */}
          <motion.div
            {...fade(0.05)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2"
          >
            <span className="size-2 animate-pulse rounded-full bg-green-500" />
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-400">
              Disponible pour une mission
            </span>
          </motion.div>

          {/* Handwriting */}
          <motion.p
            {...fade(0.12)}
            className="mb-2 font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]"
          >
            Bonjour, je suis
          </motion.p>

          {/* Nom en Black Han Sans */}
          <div className="font-[family-name:var(--font-display)] uppercase leading-[0.92] text-foreground">
            <motion.span {...fade(0.18)} className="block text-[clamp(3rem,13vw,9.5rem)]">
              Gael
            </motion.span>
            <motion.span {...fade(0.26)} className="block text-[clamp(3rem,13vw,9.5rem)]">
              Richard<span className="text-[#7158ff]">!</span>
            </motion.span>
          </div>

          {/* Description */}
          <motion.p
            {...fade(0.4)}
            className="mt-7 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base"
          >
            Développeur web freelance basé en France. Je crée des sites et
            applications web sur-mesure — rapides, propres, et pensés
            pour vous démarquer.
          </motion.p>

          {/* Tech tags */}
          <motion.div {...fade(0.5)} className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border bg-muted/50 px-3 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div {...fade(0.62)} className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="#contact"
              className="rounded-xl bg-[#7158ff] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-85"
            >
              Démarrer un projet
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Voir les tarifs →
            </Link>
          </motion.div>
        </div>

        {/* ── Colonne droite : texte décoratif ────────── */}
        <div
          aria-hidden
          className="pointer-events-none hidden select-none items-center justify-end overflow-hidden lg:flex"
        >
          <p className="font-[family-name:var(--font-display)] uppercase leading-[0.85] text-foreground/[0.05] text-[clamp(5rem,12vw,11rem)] text-right -ml-16">
            Deve
            <br />
            lopp
            <br />
            eur
            <br />
            web
          </p>
        </div>

      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="h-6 w-px bg-gradient-to-b from-muted-foreground/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
