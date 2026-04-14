"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  technologies: string[];
  category: string;
  isPublished: boolean;
  order: number;
};

export function FeatureSectionDB() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data))
      .catch(() => setProjects([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-5xl px-6 md:px-8">

        <div className="mb-14 text-center">
          <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
            Créations
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-foreground">
            Projets realises
          </h2>
        </div>

        {isLoading && (
          <div className="flex flex-col divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-6 py-8">
                <Skeleton className="h-10 w-10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="hidden sm:block h-16 w-24 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <p className="text-center font-mono text-sm text-muted-foreground">
            Les projets arrivent bientôt...
          </p>
        )}

        {!isLoading && projects.length > 0 && (
          <div className="flex flex-col">
            {projects.map((p, i) => (
              <motion.a
                key={p.id}
                href={p.url || undefined}
                target={p.url ? "_blank" : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group -mx-4 flex items-center gap-5 border-t border-border px-4 py-7 transition-colors duration-200 last:border-b hover:bg-muted/40 md:gap-8"
              >
                {/* Numéro */}
                <span className="font-[family-name:var(--font-display)] text-4xl leading-none text-[#7158ff]/20 transition-colors duration-300 group-hover:text-[#7158ff]/60 shrink-0 md:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Contenu */}
                <div className="flex flex-1 flex-col gap-2 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-[family-name:var(--font-display)] text-xl uppercase leading-none text-foreground transition-colors group-hover:text-[#7158ff] md:text-2xl">
                      {p.title}
                    </h3>
                    <ArrowUpRight className="size-4 shrink-0 text-[#7158ff] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                  {p.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.technologies.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-[#7158ff]/25 bg-[#7158ff]/10 px-2.5 py-0.5 font-mono text-[11px] text-[#7158ff]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Miniature */}
                <div className="hidden sm:block shrink-0 w-28 overflow-hidden rounded-xl border border-transparent transition-all duration-300 group-hover:border-[#7158ff]/30 group-hover:shadow-md group-hover:shadow-[#7158ff]/10">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      style={{ height: "72px" }}
                    />
                  ) : (
                    <div className="flex h-[72px] items-center justify-center bg-muted">
                      <span className="font-[family-name:var(--font-display)] text-3xl uppercase text-muted-foreground/20">
                        {p.title[0]}
                      </span>
                    </div>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
