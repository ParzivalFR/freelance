import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/dashboard/project-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Portfolio"
        title="Modifier le "
        titleAccent="projet"
        description={project.title}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/projects">
              <ArrowLeft className="mr-2 size-4" />
              Retour
            </Link>
          </Button>
        }
      />

      <ProjectForm initialData={project} />
    </div>
  );
}
