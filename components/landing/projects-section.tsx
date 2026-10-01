"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export type LandingProject = {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  label: string | null;
  category: string;
  featured: boolean;
};

const VISIBLE = 5;

const categoryLabels: Record<string, string> = {
  web: "Site web",
  app: "Application web",
  ecommerce: "E-commerce",
  landing: "Landing page",
  blog: "Blog",
  mobile: "Application mobile",
};

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Cadre de navigateur autour de la capture : il suffit d'envoyer une capture
// brute du site depuis l'admin.
export function BrowserShot({
  src,
  alt,
  host,
  className,
}: {
  src: string;
  alt: string;
  host?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden border bg-card", className)}>
      <div className="flex items-center gap-3 border-b px-3 py-2 font-[family-name:var(--font-jetbrains)] text-[11px] text-muted-foreground">
        <span className="flex shrink-0 gap-1.5">
          <i className="size-2 rounded-full bg-input" />
          <i className="size-2 rounded-full bg-input" />
          <i className="size-2 rounded-full bg-input" />
        </span>
        <span className="truncate">{host}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="block aspect-[16/9.4] w-full object-cover object-top"
      />
    </div>
  );
}

function ProjectCard({ project, big }: { project: LandingProject; big: boolean }) {
  const host = hostOf(project.url);
  return (
    <a
      href={project.url || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex min-w-0 flex-col gap-5 overflow-hidden rounded-[28px] border bg-muted px-6 pt-6 md:px-8 md:pt-8",
        big && "md:col-span-2 md:grid md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-12",
      )}
    >
      <div className={cn(big && "md:pb-8")}>
        <p className="text-sm font-semibold text-muted-foreground">
          {project.label || categoryLabels[project.category] || "Projet"}
        </p>
        <h3
          className={cn(
            "mt-1.5 font-bold leading-tight",
            big ? "text-3xl md:text-5xl" : "text-2xl md:text-[2rem]",
          )}
        >
          {project.title}
        </h3>
        <p
          className={cn(
            "mt-2 max-w-[40ch] text-foreground/80",
            big ? "line-clamp-4" : "line-clamp-2",
          )}
        >
          {project.description}
        </p>
        {big && host && (
          <span className="mt-4 inline-block border-b-2 border-foreground font-semibold">
            {host}
          </span>
        )}
      </div>
      {project.image && (
        <BrowserShot
          src={project.image}
          alt={`Aperçu de ${project.title}`}
          host={host}
          className="rounded-t-xl border-b-0 shadow-[0_-14px_44px_-28px_rgba(30,31,36,0.4)] transition-transform duration-300 group-hover:-translate-y-1.5"
        />
      )}
    </a>
  );
}

export default function ProjectsSection({ projects }: { projects: LandingProject[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? projects : projects.slice(0, VISIBLE);

  return (
    <section id="realisations" className="scroll-mt-24 pb-16 md:pb-28">
      <div className="mx-auto max-w-[1120px] px-5">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[clamp(1.9rem,4.4vw,3rem)] font-bold leading-[1.08]">
            Ce que j'ai fabriqué <span className="hl">récemment</span>
          </h2>
          <p className="max-w-[42ch] text-muted-foreground">
            Des sites, des applications et des outils. Tous en ligne, tous utilisés.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          {shown.map((p, i) => (
            <ProjectCard key={p.id} project={p} big={i === 0 && p.featured} />
          ))}
        </div>

        {projects.length > VISIBLE && !showAll && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll(true)}
              className="rounded-full border bg-card px-6 py-3 font-semibold transition-transform hover:-translate-y-0.5"
            >
              Voir tous les projets ({projects.length})
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
