import { ProjectForm } from "@/components/dashboard/project-form";
import { prisma } from "@/lib/prisma";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Modifier le projet
        </h1>
        <p className="text-muted-foreground">
          Modifiez les informations de votre projet
        </p>
      </div>

      <ProjectForm initialData={project} />
    </div>
  );
}
