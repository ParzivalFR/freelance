import { Plus } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { ProjectsTable } from "@/components/dashboard/projects-table";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Vos réalisations"
        title="Pro"
        titleAccent="jets"
        description={
          projects.length > 0
            ? `${projects.length} projet${projects.length > 1 ? "s" : ""} dans le portfolio. L'ordre défini ici est celui affiché sur la landing.`
            : "Aucun projet pour le moment. Ajoutez votre première réalisation pour la voir apparaître sur la landing."
        }
        actions={
          <Button asChild className="ring-4 ring-[#7158ff]/20">
            <Link href="/admin/projects/new">
              <Plus className="mr-2 size-4" />
              Nouveau projet
            </Link>
          </Button>
        }
      />

      <ProjectsTable projects={projects} />
    </div>
  );
}
