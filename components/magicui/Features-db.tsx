"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
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
  featured?: boolean;
  order: number;
};

function ImageModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-3xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
          >
            <X className="size-6" />
          </button>
          <img
            src={project.image}
            alt={project.title}
            className="w-full rounded-2xl border border-white/10 shadow-2xl object-cover"
          />
          <p className="mt-3 text-center font-[family-name:var(--font-display)] text-sm uppercase tracking-widest text-white/50">
            {project.title}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function FeatureSectionDB() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomed, setZoomed] = useState<Project | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data))
      .catch(() => setProjects([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="features" className="py-20">
      {zoomed && <ImageModal project={zoomed} onClose={() => setZoomed(null)} />}

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
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "150px 0px" }}
                transition={{ duration: 0.3, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                className={`group -mx-4 flex items-center gap-5 border-t border-border px-4 transition-colors duration-200 last:border-b md:gap-8 ${
                  p.featured
                    ? "border-l-2 border-l-[#7158ff]/60 bg-[#7158ff]/[0.04] py-8 hover:bg-[#7158ff]/[0.07]"
                    : "py-7 hover:bg-muted/40"
                }`}
              >
                {/* Numéro */}
                <span className={`font-[family-name:var(--font-display)] leading-none shrink-0 transition-colors duration-300 ${
                  p.featured
                    ? "text-4xl text-[#7158ff]/70 group-hover:text-[#7158ff] md:text-5xl"
                    : "text-4xl text-[#7158ff]/20 group-hover:text-[#7158ff]/60 md:text-5xl"
                }`}>
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Contenu — cliquable vers le projet */}
                <a
                  href={p.url || undefined}
                  target={p.url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex flex-1 flex-col gap-2 min-w-0"
                >
                  <div className="flex items-center gap-3">
                    <h3 className={`font-[family-name:var(--font-display)] uppercase leading-none text-foreground transition-colors group-hover:text-[#7158ff] ${
                      p.featured ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
                    }`}>
                      {p.title}
                    </h3>
                    {p.featured && (
                      <span className="shrink-0 rounded-full border border-[#7158ff]/30 bg-[#7158ff]/10 px-2 py-0.5 font-mono text-[10px] text-[#7158ff]">
                        ✦ à la une
                      </span>
                    )}
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
                </a>

                {/* Miniature — cliquable pour le zoom */}
                {p.image && (
                  <button
                    type="button"
                    onClick={() => setZoomed(p)}
                    className={`hidden sm:block shrink-0 overflow-hidden rounded-xl border border-transparent transition-all duration-300 group-hover:border-[#7158ff]/30 group-hover:shadow-md group-hover:shadow-[#7158ff]/10 cursor-zoom-in ${
                      p.featured ? "w-36" : "w-28"
                    }`}
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      style={{ height: p.featured ? "100px" : "72px" }}
                    />
                  </button>
                )}
                {!p.image && (
                  <div className={`hidden sm:flex shrink-0 items-center justify-center rounded-xl bg-muted ${
                    p.featured ? "w-36 h-[100px]" : "w-28 h-[72px]"
                  }`}>
                    <span className="font-[family-name:var(--font-display)] text-3xl uppercase text-muted-foreground/20">
                      {p.title[0]}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
