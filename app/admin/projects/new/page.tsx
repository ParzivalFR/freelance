import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/dashboard/project-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Portfolio"
        title="Nouveau "
        titleAccent="projet"
        description="Ajoutez une réalisation à votre portfolio. Elle apparaîtra sur la landing dès l'enregistrement."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/projects">
              <ArrowLeft className="mr-2 size-4" />
              Retour
            </Link>
          </Button>
        }
      />

      <ProjectForm />
    </div>
  );
}
