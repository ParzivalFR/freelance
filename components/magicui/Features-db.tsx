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

const ProjectCard = ({ project, index }: { project: Project; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:border-[#7158ff]/40 hover:shadow-lg hover:shadow-[#7158ff]/5"
  >
    {/* Image */}
    <div className="aspect-video overflow-hidden bg-muted">
      {project.image ? (
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-muted">
          <span className="font-[family-name:var(--font-display)] text-7xl uppercase text-muted-foreground/20">
            {project.title[0]}
          </span>
        </div>
      )}
    </div>

    {/* Contenu */}
    <div className="flex flex-1 flex-col gap-3 p-5">
      <h3 className="font-[family-name:var(--font-display)] text-xl uppercase leading-none text-foreground">
        {project.title}
      </h3>

      <p className="flex-1 font-mono text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>

      {/* Tech tags */}
      {project.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-[#7158ff]/25 bg-[#7158ff]/10 px-2.5 py-0.5 font-mono text-[11px] text-[#7158ff]"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Lien */}
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#7158ff] transition-opacity hover:opacity-70"
        >
          Voir le projet
          <ArrowUpRight className="size-3.5" />
        </a>
      )}
    </div>
  </motion.div>
);

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
      <div className="mx-auto max-w-7xl px-6 md:px-8">

        {/* Header */}
        <div className="mb-14 text-center">
          <p className="font-[family-name:var(--font-handwriting)] text-2xl text-[#7158ff]">
            Créations
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-foreground">
            Projets realises
          </h2>
        </div>

        {/* Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border">
                <Skeleton className="aspect-video w-full" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vide */}
        {!isLoading && projects.length === 0 && (
          <p className="text-center font-mono text-sm text-muted-foreground">
            Les projets arrivent bientôt...
          </p>
        )}

        {/* Grille */}
        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
