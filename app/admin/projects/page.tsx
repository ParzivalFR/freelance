import { Plus } from "lucide-react";
import Link from "next/link";

import { ProjectsTable } from "@/components/dashboard/projects-table";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function ProjectsPage() {
  let projects;

  try {
    projects = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error; // Re-throw to see the actual error in Vercel logs
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Projets
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Gérez votre portfolio et vos réalisations
          </p>
        </div>
        <Button asChild size="sm" className="w-fit">
          <Link href="/admin/projects/new">
            <Plus className="mr-2 size-4" />
            <span className="hidden sm:inline">Nouveau Projet</span>
            <span className="sm:hidden">Nouveau</span>
          </Link>
        </Button>
      </div>

      <ProjectsTable projects={projects} />
    </div>
  );
}
